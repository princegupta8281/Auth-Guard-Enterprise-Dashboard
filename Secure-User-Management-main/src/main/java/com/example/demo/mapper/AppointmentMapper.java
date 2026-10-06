package com.example.demo.mapper;

import com.example.demo.dto.AppointmentResponse;
import com.example.demo.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "doctorName", target = "doctorName")
    @Mapping(source = "appointmentDate", target = "appointmentDate")
    @Mapping(source = "status", target = "status")
    AppointmentResponse toAppointmentResponse(Appointment appointment);
}