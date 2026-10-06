package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EmailScheduler {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailScheduler.class);

    @Scheduled(fixedRate = 300000)
    public void sendScheduledEmails() {

        logger.info("Scheduled email job executed successfully");
    }
}