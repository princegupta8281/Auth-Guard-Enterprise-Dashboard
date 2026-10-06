
package com.example.demo.service;

import com.example.demo.dto.DashboardResponse;
import com.example.demo.entity.Role;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

@Service
public class DashboardService {

    private final UserRepository userRepository;

    public DashboardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Cacheable(value = "dashboardStats")
    public DashboardResponse getDashboardStats() {

        long totalUsers = userRepository.count();

        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        long totalNormalUsers = userRepository.countByRole(Role.USER);

        long verifiedUsers = userRepository.countByEmailVerified(true);

        long unverifiedUsers = userRepository.countByEmailVerified(false);

        return new DashboardResponse(
                totalUsers,
                totalAdmins,
                totalNormalUsers,
                verifiedUsers,
                unverifiedUsers
        );
    }
}