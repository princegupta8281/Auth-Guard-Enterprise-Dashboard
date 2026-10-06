package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.exception.EmailAlreadyRegisteredException;
import com.example.demo.exception.EmailNotVerifiedException;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.InvalidTokenException;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;

@Service
public class AuthService {
    private static final Logger logger =
            LoggerFactory.getLogger(AuthService.class);
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;
    private final MfaService mfaService;
    private final String publicBaseUrl;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            AuditLogService auditLogService,
            MfaService mfaService,
            @Value("${app.public-base-url:http://localhost:8081}") String publicBaseUrl) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
        this.mfaService = mfaService;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }
    @Transactional
    public User register(RegisterRequest request) {
        logger.info("User registration initiated");
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Registration failed: email already registered");
            throw new EmailAlreadyRegisteredException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.USER);

        String verificationToken = UUID.randomUUID().toString();

        user.setVerificationToken(verificationToken);
        user.setEmailVerified(false);

        // Save user first
        User savedUser = userRepository.save(user);

        // Create verification link
        String verificationLink =
                publicBaseUrl + "/api/auth/verify?token="
                        + savedUser.getVerificationToken();

        try {
            emailService.sendEmail(
                    savedUser.getEmail(),
                    "Verify Your Email",
                    "Hello " + savedUser.getName() + ",\n\n"
                            + "Please verify your email by clicking this link:\n"
                            + verificationLink
                            + "\n\nThank you!"
            );
            logger.info("Verification email sent successfully");
        } catch (RuntimeException e) {
            logger.warn("Failed to send verification email for user {}", savedUser.getEmail(), e);
            throw e;
        }
        
        auditLogService.logAction("USER_REGISTER", "New user registered: " + savedUser.getName(), savedUser.getEmail());

        return savedUser;
    }

    @Transactional(readOnly = true)
    public com.example.demo.dto.LoginResponse login(LoginRequest request) {

        logger.info("Login attempt received");

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed: invalid credentials");
                    return new InvalidCredentialsException("Invalid email or password");
                });

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            logger.warn("Login failed: invalid credentials");
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            logger.warn("Login blocked: email not verified");
            throw new EmailNotVerifiedException(
                    "Please verify your email before login"
            );
        }

        if (user.isMfaEnabled()) {
            if (request.getMfaCode() == null || request.getMfaCode().trim().isEmpty()) {
                logger.info("MFA required for user: {}", user.getEmail());
                return new com.example.demo.dto.LoginResponse(true);
            }
            if (!mfaService.verifyCode(user.getMfaSecret(), request.getMfaCode())) {
                logger.warn("Login blocked: Invalid MFA code");
                throw new InvalidCredentialsException("Invalid MFA code");
            }
        }

        logger.info("User role during login: {}", user.getRole().name());

        logger.info("Login successful");
        
        auditLogService.logAction("USER_LOGIN", "User logged in successfully", user.getEmail());

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new com.example.demo.dto.LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getProfileImage()
        );
    }

    @Transactional
    public void verifyEmail(String token) {

        logger.info("Email verification initiated");

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    logger.warn("Email verification failed: invalid token");
                    return new InvalidTokenException("Invalid verification token");
                });

        user.setEmailVerified(true);
        user.setVerificationToken(null);

        userRepository.save(user);

        logger.info("Email verified successfully");
    }

    @Transactional
    public void forgotPassword(String email) {
        logger.info("Forgot password request received");
        var userResult = userRepository.findByEmail(email);
        if (userResult.isEmpty()) {
            logger.info("Password reset request ignored for an unknown account");
            return;
        }
        User user = userResult.get();

        String resetToken = UUID.randomUUID().toString();

        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(
                LocalDateTime.now().plusMinutes(15)
        );

        userRepository.save(user);

        String resetLink =
                publicBaseUrl + "/#reset-password?token="
                        + resetToken;

        try {
            emailService.sendEmail(
                    user.getEmail(),
                    "Reset Your Password",
                    "Hello " + user.getName() + ",\n\n"
                            + "Click the following link to reset your password:\n"
                            + resetLink
                            + "\n\n"
                            + "This link will expire in 15 minutes."
            );
            logger.info("Password reset email sent successfully");
        } catch (Exception e) {
            logger.warn("Failed to send reset email. Use this link to reset password: {}", resetLink);
        }
    }
    @Transactional
    public void resetPassword(String token, String newPassword) {

        logger.info("Password reset initiated");

        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> {
                    logger.warn("Password reset failed: invalid token");
                    return new InvalidTokenException(
                            "Invalid or expired reset token"
                    );
                });

        LocalDateTime now = LocalDateTime.now();
        if (user.getResetPasswordTokenExpiry() == null ||
                !user.getResetPasswordTokenExpiry().isAfter(now)) {

            logger.warn("Password reset failed: token expired");
            throw new InvalidTokenException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

        userRepository.save(user);

        logger.info("Password reset successful");
        
        auditLogService.logAction("PASSWORD_RESET", "User password was reset", user.getEmail());
    }
}