package com.example.demo.dto;

public class LoginResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String profileImage;
    private boolean mfaRequired;

    public LoginResponse(String token, Long userId, String name, String email, String role, String profileImage) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profileImage = profileImage;
        this.mfaRequired = false;
    }

    public LoginResponse(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public boolean isMfaRequired() {
        return mfaRequired;
    }

    public void setMfaRequired(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }
}
