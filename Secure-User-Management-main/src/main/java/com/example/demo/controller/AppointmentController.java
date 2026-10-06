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

    public AppointmentController(
            AppointmentService appointmentService,
            AppointmentMapper appointmentMapper) {

        this.appointmentService = appointmentService;
        this.appointmentMapper = appointmentMapper;
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
}