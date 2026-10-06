package com.example.demo.dto;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String profileImage;
    private boolean emailVerified;
    private boolean mfaEnabled;
    public UserResponse() {
    }
    public UserResponse(
            Long id,
            String name,
            String email,
            String role,
            String profileImage) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profileImage = profileImage;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isMfaEnabled() {
        return mfaEnabled;
    }

    public void setMfaEnabled(boolean mfaEnabled) {
        this.mfaEnabled = mfaEnabled;
    }
}