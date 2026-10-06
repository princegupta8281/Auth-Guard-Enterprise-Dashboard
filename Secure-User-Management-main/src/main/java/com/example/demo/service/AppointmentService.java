package com.example.demo.service;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    public Appointment createAppointment(
            Long userId,
            Appointment appointment) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        ));

        appointment.setUser(user);

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getUserAppointments(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + userId
            );
        }

        return appointmentRepository.findByUserId(userId);
    }
}