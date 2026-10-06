package com.example.demo.controller;

import com.example.demo.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String to) {

        emailService.sendEmail(
                to,
                "Test Email - User Management API",
                "Hello! This is a test email from our Spring Boot application."
        );

        return ResponseEntity.ok(
                "Test email sent successfully"
        );
    }
}