package com.example.demo.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

class UserTest {

    @Test
    void builderDefaultsEmailVerifiedToFalse() {
        User user = User.builder()
                .name("Test User")
                .email("test@example.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();

        assertFalse(user.isEmailVerified());
    }
}
