package com.example.demo.service;

import com.example.demo.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class NotificationScheduler {

    private static final Logger logger =
            LoggerFactory.getLogger(NotificationScheduler.class);

    private final NotificationRepository notificationRepository;

    public NotificationScheduler(
            NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void deleteOldNotifications() {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        int deletedCount =
                notificationRepository.deleteOldNotifications(cutoff);

        logger.info("Notification cleanup completed. Deleted: {}",
                deletedCount);
    }
}