package com.example.demo.service;

import com.example.demo.dto.DashboardResponse;
import com.example.demo.entity.Role;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TicketRepository ticketRepository;
    private final AppointmentRepository appointmentRepository;

    public DashboardService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            TicketRepository ticketRepository,
            AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.ticketRepository = ticketRepository;
        this.appointmentRepository = appointmentRepository;
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

    public Map<String, Object> getSystemOverview() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers", userRepository.count());
        map.put("totalProjects", projectRepository.count());
        map.put("totalTasks", taskRepository.count());
        map.put("totalTickets", ticketRepository.count());
        map.put("totalAppointments", appointmentRepository.count());
        return map;
    }
}