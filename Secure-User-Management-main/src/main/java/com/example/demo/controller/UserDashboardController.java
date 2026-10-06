package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserDashboardController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('USER')")
    public String userDashboard() {
        return "Welcome to User Dashboard";
    }
}