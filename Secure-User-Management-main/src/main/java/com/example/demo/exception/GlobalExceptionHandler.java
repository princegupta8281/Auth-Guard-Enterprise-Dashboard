package com.example.demo.exception;

import com.example.demo.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.ObjectError;

import java.time.LocalDateTime;
import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            EmailAlreadyRegisteredException ex,
            HttpServletRequest request) {

        return errorResponse(
                HttpStatus.CONFLICT,
                "Conflict",
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataConflict(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        return errorResponse(
                HttpStatus.CONFLICT,
                "Conflict",
                "The request conflicts with existing data",
                request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex,
            HttpServletRequest request) {

        return errorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidToken(
            InvalidTokenException ex,
            HttpServletRequest request) {

        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler({ResourceNotFoundException.class, java.util.NoSuchElementException.class})
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            Exception ex,
            HttpServletRequest request) {

        return errorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String message = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(ObjectError::getDefaultMessage)
                .filter(Objects::nonNull)
                .map(String::strip)
                .filter(value -> !value.isEmpty())
                .findFirst()
                .orElse("Invalid input");

        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", message, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        String message = ex.getConstraintViolations()
                .stream()
                .map(violation -> violation.getMessage())
                .filter(Objects::nonNull)
                .map(String::strip)
                .filter(value -> !value.isEmpty())
                .findFirst()
                .orElse("Invalid input");

        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", message, request);
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ErrorResponse> handleMalformedRequest(
            Exception ex,
            HttpServletRequest request) {

        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Invalid request", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {

        return errorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Method Not Allowed",
                "The request method is not supported",
                request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex,
            HttpServletRequest request) {

        return errorResponse(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Unsupported Media Type",
                "The request content type is not supported",
                request);
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotAcceptable(
            HttpMediaTypeNotAcceptableException ex,
            HttpServletRequest request) {

        return errorResponse(
                HttpStatus.NOT_ACCEPTABLE,
                "Not Acceptable",
                "The requested response format is not available",
                request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ErrorResponse> handlePasswordMismatch(
            PasswordMismatchException ex,
            HttpServletRequest request) {

        return errorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        logger.error("Unhandled error while processing request {}", request.getRequestURI(), ex);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred",
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    private ResponseEntity<ErrorResponse> errorResponse(
            HttpStatus status,
            String error,
            String message,
            HttpServletRequest request) {

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                error,
                message == null || message.isBlank() ? status.getReasonPhrase() : message,
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(response);
    }
    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerified(
            EmailNotVerifiedException ex,
            HttpServletRequest request) {

        return errorResponse(
                HttpStatus.FORBIDDEN,
                "Email Not Verified",
                ex.getMessage(),
                request);
    }
}