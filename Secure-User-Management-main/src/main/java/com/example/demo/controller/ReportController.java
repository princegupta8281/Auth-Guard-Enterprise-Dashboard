package com.example.demo.controller;

import com.example.demo.dto.MonthlyUserReportResponse;
import com.example.demo.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/monthly")
    public ResponseEntity<List<MonthlyUserReportResponse>> getMonthlyUserReport() {

        return ResponseEntity.ok(
                reportService.getMonthlyUserReport()
        );
    }
}