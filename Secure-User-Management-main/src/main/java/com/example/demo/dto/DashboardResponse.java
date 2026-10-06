package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long totalUsers;
    private long totalAdmins;
    private long totalNormalUsers;
    private long verifiedUsers;
    private long unverifiedUsers;
}