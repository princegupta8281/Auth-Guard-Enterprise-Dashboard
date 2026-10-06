package com.example.demo.mapper;

import com.example.demo.dto.UserResponse;
import com.example.demo.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserResponseMapper {

    public UserResponse toResponse(User user) {

        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());

        if (user.getRole() != null) {
            response.setRole(user.getRole().name());
        }

        response.setProfileImage(user.getProfileImage());
        response.setEmailVerified(user.isEmailVerified());
        response.setMfaEnabled(user.isMfaEnabled());

        return response;
    }
}