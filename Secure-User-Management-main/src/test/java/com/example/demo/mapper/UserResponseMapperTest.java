package com.example.demo.mapper;

import com.example.demo.dto.UserResponse;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class UserResponseMapperTest {

    @Test
    void responseMapperIncludesEmailVerificationStatus() {
        User user = User.builder()
                .id(7L)
                .name("Test User")
                .email("test@example.com")
                .role(Role.USER)
                .emailVerified(true)
                .build();

        UserResponse response = new UserResponseMapper().toResponse(user);

        assertTrue(response.isEmailVerified());
    }

    @Test
    void userMapperIncludesEmailVerificationStatus() {
        User user = User.builder()
                .id(7L)
                .name("Test User")
                .email("test@example.com")
                .role(Role.USER)
                .emailVerified(true)
                .build();

        UserResponse response = new UserMapper() {
        }.toUserResponse(user);

        assertTrue(response.isEmailVerified());
    }
}
