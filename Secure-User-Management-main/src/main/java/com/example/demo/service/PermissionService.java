package com.example.demo.service;

import com.example.demo.entity.Permission;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import java.util.List;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @CacheEvict(value = "permissions", allEntries = true)
    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }


    @Cacheable(value = "permissions")
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Permission getPermissionByName(String name) {

        return permissionRepository.findByName(name)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permission not found: " + name
                        ));
    }
}