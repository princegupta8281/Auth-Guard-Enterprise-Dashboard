package com.example.demo.service;

import com.example.demo.dto.MonthlyUserReportResponse;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final UserRepository userRepository;

    public ReportService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<MonthlyUserReportResponse> getMonthlyUserReport() {

        List<Object[]> results = userRepository.getMonthlyUserReport();

        List<MonthlyUserReportResponse> reports = new ArrayList<>();

        for (Object[] row : results) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            String monthStr = String.format("%04d-%02d", year, month);
            long totalUsers = ((Number) row[2]).longValue();

            reports.add(
                    new MonthlyUserReportResponse(
                            monthStr,
                            totalUsers
                    )
            );
        }

        return reports;
    }
}