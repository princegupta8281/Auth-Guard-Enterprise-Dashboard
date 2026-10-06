package com.example.demo.mapper;

import com.example.demo.dto.PermissionResponse;
import com.example.demo.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionResponse toPermissionResponse(Permission permission);
}