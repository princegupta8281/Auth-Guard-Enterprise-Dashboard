package com.example.demo.controller;

import com.example.demo.dto.AppointmentResponse;
import com.example.demo.entity.Appointment;
import com.example.demo.mapper.AppointmentMapper;
import com.example.demo.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentMapper appointmentMapper;
    private final com.example.demo.service.UserService userService;

    public AppointmentController(
            AppointmentService appointmentService,
            AppointmentMapper appointmentMapper,
            com.example.demo.service.UserService userService) {

        this.appointmentService = appointmentService;
        this.appointmentMapper = appointmentMapper;
        this.userService = userService;
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<AppointmentResponse> response =
                appointmentService.getAllAppointments()
                        .stream()
                        .map(appointmentMapper::toAppointmentResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @PathVariable Long userId,
            @RequestBody Appointment appointment) {

        Appointment savedAppointment =
                appointmentService.createAppointment(userId, appointment);

        return ResponseEntity.ok(
                appointmentMapper.toAppointmentResponse(savedAppointment)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentResponse>> getUserAppointments(
            @PathVariable Long userId) {

        List<AppointmentResponse> response =
                appointmentService.getUserAppointments(userId)
                        .stream()
                        .map(appointmentMapper::toAppointmentResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email) {

        com.example.demo.entity.User user = userService.getUserByEmail(email);
        boolean isAdmin = user.getRole() == com.example.demo.entity.Role.ADMIN;
        Appointment cancelled = appointmentService.cancelAppointment(id, user.getId(), isAdmin);

        return ResponseEntity.ok(appointmentMapper.toAppointmentResponse(cancelled));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {

        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        Appointment updated = appointmentService.updateStatus(id, status);

        return ResponseEntity.ok(appointmentMapper.toAppointmentResponse(updated));
    }
}