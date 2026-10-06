package com.example.demo.exception;

import com.example.demo.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRequestURI("/api/auth/register");
        request = servletRequest;
    }

    @Test
    void duplicateEmailReturnsConflict() {
        var response = handler.handleConflict(
                new EmailAlreadyRegisteredException("Email already registered"), request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Email already registered", response.getBody().getMessage());
        assertResponseMetadata(response.getBody(), HttpStatus.CONFLICT, "/api/auth/register");
    }

    @Test
    void databaseConstraintViolationReturnsConflictWithoutDatabaseDetails() {
        var response = handler.handleDataConflict(
                new DataIntegrityViolationException("sensitive database detail"), request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("The request conflicts with existing data", response.getBody().getMessage());
    }

    @Test
    void invalidCredentialsReturnUnauthorized() {
        var response = handler.handleInvalidCredentials(
                new InvalidCredentialsException("Invalid email or password"), request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid email or password", response.getBody().getMessage());
    }

    @Test
    void invalidTokenReturnsBadRequest() {
        var response = handler.handleInvalidToken(
                new InvalidTokenException("Invalid verification token"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid verification token", response.getBody().getMessage());
    }

    @Test
    void unexpectedErrorsDoNotExposeInternalExceptionMessages() {
        var response = handler.handleGenericException(
                new IllegalStateException("internal secret"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ErrorResponse error = response.getBody();
        assertEquals("An unexpected error occurred", error.getMessage());
        assertResponseMetadata(error, HttpStatus.INTERNAL_SERVER_ERROR, "/api/auth/register");
    }

    @Test
    void resourceNotFoundReturnsNotFound() {
        var response = handler.handleResourceNotFound(
                new ResourceNotFoundException("User not found"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("User not found", response.getBody().getMessage());
    }

    @Test
    void methodArgumentNotValidReturnsBadRequest() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getAllErrors()).thenReturn(java.util.List.of(
                new FieldError("object", "field", "Invalid input")));
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var response = handler.handleValidationException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid input", response.getBody().getMessage());
    }

    @Test
    void methodArgumentNotValidUsesFallbackWhenNoFieldErrorsExist() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getAllErrors()).thenReturn(java.util.List.of());
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var response = handler.handleValidationException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid input", response.getBody().getMessage());
    }

    @Test
    void methodArgumentNotValidUsesFallbackWhenMessagesAreNullOrBlank() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getAllErrors()).thenReturn(java.util.List.of(
                new FieldError("object", "first", null),
                new FieldError("object", "second", "  ")));
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var response = handler.handleValidationException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid input", response.getBody().getMessage());
    }

    @Test
    void methodArgumentNotValidIncludesObjectLevelErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getAllErrors()).thenReturn(java.util.List.of(
                new ObjectError("object", "Object-level validation failed")));
        when(ex.getBindingResult()).thenReturn(bindingResult);

        var response = handler.handleValidationException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Object-level validation failed", response.getBody().getMessage());
    }

    @Test
    void constraintViolationReturnsBadRequest() {
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Invalid parameter");
        ConstraintViolationException ex = new ConstraintViolationException(
                "validation failed", java.util.Set.of(violation));

        var response = handler.handleConstraintViolation(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid parameter", response.getBody().getMessage());
    }

    @Test
    void malformedRequestBodyReturnsBadRequest() {
        var response = handler.handleMalformedRequest(
                mock(HttpMessageNotReadableException.class), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request", response.getBody().getMessage());
    }

    @Test
    void unsupportedMethodReturnsMethodNotAllowed() {
        var response = handler.handleMethodNotSupported(
                new HttpRequestMethodNotSupportedException("TRACE"), request);

        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, response.getStatusCode());
        assertEquals("The request method is not supported", response.getBody().getMessage());
    }

    @Test
    void passwordMismatchReturnsBadRequest() {
        var response = handler.handlePasswordMismatch(
                new PasswordMismatchException("Passwords do not match"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Passwords do not match", response.getBody().getMessage());
    }

    @Test
    void emailNotVerifiedReturnsForbidden() {
        var response = handler.handleEmailNotVerified(
                new EmailNotVerifiedException("Email Not Verified"), request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Email Not Verified", response.getBody().getMessage());
    }

    private void assertResponseMetadata(
            ErrorResponse response,
            HttpStatus expectedStatus,
            String expectedPath) {

        assertEquals(expectedStatus.value(), response.getStatus());
        assertEquals(expectedPath, response.getPath());
        assertEquals(expectedStatus.getReasonPhrase(), response.getError());
        org.junit.jupiter.api.Assertions.assertNotNull(response.getTimestamp());
    }
}
