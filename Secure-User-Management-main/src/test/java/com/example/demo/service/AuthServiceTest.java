package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.exception.EmailAlreadyRegisteredException;
import com.example.demo.exception.EmailNotVerifiedException;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.InvalidTokenException;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private EmailService emailService;
    private AuditLogService auditLogService;
    private MfaService mfaService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        emailService = mock(EmailService.class);
        auditLogService = mock(AuditLogService.class);
        mfaService = mock(MfaService.class);
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                emailService,
                auditLogService,
                mfaService,
                "http://localhost:8081");
    }

    @Test
    void registerCreatesUnverifiedUserAndSendsVerificationEmail() {
        when(userRepository.existsByEmail("person@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registered = authService.register(
                new RegisterRequest("Person", "person@example.com", "password"));

        assertEquals("Person", registered.getName());
        assertEquals("person@example.com", registered.getEmail());
        assertEquals("encoded-password", registered.getPassword());
        assertEquals(Role.USER, registered.getRole());
        assertFalse(registered.isEmailVerified());
        assertNotNull(registered.getVerificationToken());
        verify(emailService).sendEmail(
                eq("person@example.com"),
                eq("Verify Your Email"),
                org.mockito.ArgumentMatchers.contains(
                        "http://localhost:8081/api/auth/verify?token=" + registered.getVerificationToken()));
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("person@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyRegisteredException.class, () -> authService.register(
                new RegisterRequest("Person", "person@example.com", "password")));

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(emailService);
    }

    @Test
    void registerDoesNotAutoVerifyWhenEmailDeliveryFails() {
        when(userRepository.existsByEmail("person@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        org.mockito.Mockito.doThrow(new IllegalStateException("mail unavailable"))
                .when(emailService)
                .sendEmail(eq("person@example.com"), eq("Verify Your Email"), any());

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        assertThrows(IllegalStateException.class, () -> authService.register(
                new RegisterRequest("Person", "person@example.com", "password")));

        verify(userRepository).save(savedUser.capture());
        assertFalse(savedUser.getValue().isEmailVerified());
        assertNotNull(savedUser.getValue().getVerificationToken());
    }

    @Test
    void loginReturnsTokenForVerifiedUserWithMatchingPassword() {
        User user = user("person@example.com");
        user.setId(42L);
        user.setEmailVerified(true);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken(user.getEmail(), Role.USER.name())).thenReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest(user.getEmail(), "password"));

        assertEquals("jwt-token", response.getToken());
        assertEquals(42L, response.getUserId());
        assertEquals(user.getName(), response.getName());
        assertEquals(user.getEmail(), response.getEmail());
        assertEquals(Role.USER.name(), response.getRole());
    }

    @Test
    void loginRejectsUnknownEmailAndWrongPasswordWithSameException() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        assertThrows(InvalidCredentialsException.class,
                () -> authService.login(new LoginRequest("missing@example.com", "password")));

        User user = user("person@example.com");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-password")).thenReturn(false);
        assertThrows(InvalidCredentialsException.class,
                () -> authService.login(new LoginRequest(user.getEmail(), "wrong")));
    }

    @Test
    void loginRejectsUnverifiedUser() {
        User user = user("person@example.com");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(true);

        assertThrows(EmailNotVerifiedException.class,
                () -> authService.login(new LoginRequest(user.getEmail(), "password")));

        verifyNoInteractions(jwtService);
    }

    @Test
    void verifyEmailMarksUserVerifiedAndClearsToken() {
        User user = user("person@example.com");
        user.setVerificationToken("verification-token");
        when(userRepository.findByVerificationToken("verification-token"))
                .thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        authService.verifyEmail("verification-token");

        assertTrue(user.isEmailVerified());
        assertNull(user.getVerificationToken());
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmailRejectsUnknownToken() {
        when(userRepository.findByVerificationToken("unknown")).thenReturn(Optional.empty());

        assertThrows(InvalidTokenException.class, () -> authService.verifyEmail("unknown"));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void forgotPasswordDoesNotRevealUnknownAccounts() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        authService.forgotPassword("missing@example.com");

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(emailService);
    }

    @Test
    void forgotPasswordStoresExpiringTokenAndSendsEmail() {
        User user = user("person@example.com");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        LocalDateTime beforeRequest = LocalDateTime.now();

        authService.forgotPassword(user.getEmail());

        assertNotNull(user.getResetPasswordToken());
        assertTrue(user.getResetPasswordTokenExpiry().isAfter(beforeRequest.plusMinutes(14)));
        assertTrue(user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now().plusMinutes(16)));
        verify(emailService).sendEmail(
                eq(user.getEmail()),
                eq("Reset Your Password"),
                org.mockito.ArgumentMatchers.contains(
                        "http://localhost:8081/#reset-password?token=" + user.getResetPasswordToken()));
    }

    @Test
    void resetPasswordRejectsUnknownAndExpiredTokens() {
        when(userRepository.findByResetPasswordToken("unknown")).thenReturn(Optional.empty());
        assertThrows(InvalidTokenException.class,
                () -> authService.resetPassword("unknown", "new-password"));

        User expiredUser = user("person@example.com");
        expiredUser.setResetPasswordTokenExpiry(LocalDateTime.now().minusSeconds(1));
        when(userRepository.findByResetPasswordToken("expired")).thenReturn(Optional.of(expiredUser));
        assertThrows(InvalidTokenException.class,
                () -> authService.resetPassword("expired", "new-password"));

        verify(passwordEncoder, never()).encode("new-password");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPasswordUpdatesPasswordAndConsumesToken() {
        User user = user("person@example.com");
        user.setResetPasswordToken("reset-token");
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        when(userRepository.findByResetPasswordToken("reset-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password")).thenReturn("new-encoded-password");
        when(userRepository.save(user)).thenReturn(user);

        authService.resetPassword("reset-token", "new-password");

        assertEquals("new-encoded-password", user.getPassword());
        assertNull(user.getResetPasswordToken());
        assertNull(user.getResetPasswordTokenExpiry());
        verify(userRepository).save(user);
    }

    private User user(String email) {
        User user = new User();
        user.setName("Person");
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setRole(Role.USER);
        return user;
    }
}
