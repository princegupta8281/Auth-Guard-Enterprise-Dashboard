package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.MfaService;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mfa")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class MfaController {

    private final MfaService mfaService;
    private final UserService userService;
    private final UserRepository userRepository;

    public MfaController(MfaService mfaService, UserService userService, UserRepository userRepository) {
        this.mfaService = mfaService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/setup")
    public ResponseEntity<Map<String, String>> setupMfa(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);
        userRepository.save(user);

        try {
            String qrCodeUri = mfaService.getQrCodeImageUri(secret, email);
            Map<String, String> response = new HashMap<>();
            response.put("secret", secret);
            response.put("qrCodeUri", qrCodeUri);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/enable")
    public ResponseEntity<Map<String, String>> enableMfa(Authentication authentication, @RequestBody Map<String, String> body) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        String code = body.get("code");

        if (user.getMfaSecret() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "MFA setup not initialized"));
        }

        if (mfaService.verifyCode(user.getMfaSecret(), code)) {
            user.setMfaEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "MFA enabled successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid MFA code"));
        }
    }

    @PostMapping("/disable")
    public ResponseEntity<Map<String, String>> disableMfa(Authentication authentication, @RequestBody Map<String, String> body) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        String code = body.get("code");

        if (mfaService.verifyCode(user.getMfaSecret(), code)) {
            user.setMfaEnabled(false);
            user.setMfaSecret(null);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "MFA disabled successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid MFA code"));
        }
    }
}
