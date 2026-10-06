package com.example.demo.service;

import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserFilterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.entity.Permission;
import com.example.demo.entity.User;
import com.example.demo.exception.PasswordMismatchException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.UserResponseMapper;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.specification.UserSpecification;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.cache.annotation.CacheEvict;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final PermissionRepository permissionRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final UserResponseMapper userResponseMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserResponseMapper userResponseMapper,
            PermissionRepository permissionRepository,
            FileStorageService fileStorageService,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userResponseMapper = userResponseMapper;
        this.permissionRepository = permissionRepository;
        this.fileStorageService = fileStorageService;
        this.auditLogService = auditLogService;
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    public User createUser(User user) {
        return userRepository.save(user);
    }



    public Page<User> getUsersWithPagination(Pageable pageable) {

        return userRepository.findAll(pageable);
    }

    public Page<User> searchUsers(
            String search,
            Pageable pageable) {

        return userRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        search,
                        search,
                        pageable
                );
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        ));
    }

    @CacheEvict(value = "dashboardStats", allEntries = true)
    public User updateUser(
            Long id,
            User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        ));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());

        return userRepository.save(existingUser);
    }
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public User updateMyProfile(
            String email,
            UpdateProfileRequest request) {

        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        ));

        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());

        User updatedUser = userRepository.save(existingUser);
        auditLogService.logAction("PROFILE_UPDATE", "User updated their profile details", updatedUser.getEmail());
        
        return updatedUser;
    }


    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void deleteUser(Long id) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        ));

        userRepository.delete(existingUser);
    }

    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        ));
    }

    public void changePassword(
            String email,
            ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        ));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new PasswordMismatchException(
                    "Current password is incorrect"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
        auditLogService.logAction("PASSWORD_CHANGE", "User changed their password", user.getEmail());
    }


    @Transactional
    public User assignPermission(
            Long userId,
            Long permissionId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        ));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permission not found with id: " + permissionId
                        ));

        if (user.getPermissions() == null) {
            user.setPermissions(new HashSet<>());
        }

        user.getPermissions().add(permission);

        return userRepository.save(user);
    }


    @Transactional
    public Set<Permission> getUserPermissions(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        ));

        return new HashSet<>(user.getPermissions());
    }
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public User uploadProfileImage(
            String email,
            MultipartFile file) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        ));

        String filePath = fileStorageService.saveFile(file);

        user.setProfileImage(filePath);

        return userRepository.save(user);
    }


    public Page<UserResponse> filterUsers(
            UserFilterRequest request,
            Pageable pageable) {

        Specification<User> specification = Specification
                .where(
                        UserSpecification.hasName(
                                request.getName()
                        )
                )
                .and(
                        UserSpecification.hasEmail(
                                request.getEmail()
                        )
                )
                .and(
                        UserSpecification.hasRole(
                                request.getRole()
                        )
                )
                .and(
                        UserSpecification.isEmailVerified(
                                request.getEmailVerified()
                        )
                );

        return userRepository
                .findAll(specification, pageable)
                .map(userResponseMapper::toResponse);
    }
}