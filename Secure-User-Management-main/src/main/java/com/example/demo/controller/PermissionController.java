package com.example.demo.controller;

import com.example.demo.dto.PermissionResponse;
import com.example.demo.entity.Permission;
import com.example.demo.mapper.PermissionMapper;
import com.example.demo.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;
    private final PermissionMapper permissionMapper;

    public PermissionController(
            PermissionService permissionService,
            PermissionMapper permissionMapper) {

        this.permissionService = permissionService;
        this.permissionMapper = permissionMapper;
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> createPermission(
            @RequestBody Permission permission) {

        Permission savedPermission =
                permissionService.createPermission(permission);

        return ResponseEntity.ok(
                permissionMapper.toPermissionResponse(savedPermission)
        );
    }

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {

        List<PermissionResponse> response =
                permissionService.getAllPermissions()
                        .stream()
                        .map(permissionMapper::toPermissionResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }
}