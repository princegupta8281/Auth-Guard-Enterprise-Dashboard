package com.example.demo.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

class NotificationTest {

    @Test
    void builderDefaultsReadToFalse() {
        Notification notification = Notification.builder()
                .title("Test")
                .message("Test notification")
                .build();

        assertFalse(notification.isRead());
    }
}
