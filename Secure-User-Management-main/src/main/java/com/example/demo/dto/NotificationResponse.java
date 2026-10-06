package com.example.demo.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        boolean isRead,
        LocalDateTime createdAt,
        Long userId
) {
}