
package com.example.demo.controller;

import com.example.demo.dto.NotificationResponse;
import com.example.demo.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>>
    getUserNotifications(@PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>>
    getUnreadNotifications(@PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<NotificationResponse>
    createNotification(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam String message) {

        NotificationResponse response =
                notificationService.createNotification(
                        userId, title, message);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{notificationId}/read/user/{userId}")
    public ResponseEntity<String> markAsRead(
            @PathVariable Long notificationId,
            @PathVariable Long userId) {

        notificationService.markAsRead(
                notificationId, userId);

        return ResponseEntity.ok(
                "Notification marked as read");
    }
}