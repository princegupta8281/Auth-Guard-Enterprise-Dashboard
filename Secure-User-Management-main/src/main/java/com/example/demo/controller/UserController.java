package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Permission;
import com.example.demo.entity.User;
import com.example.demo.mapper.UserMapper;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Set;
import java.util.stream.Collectors;
import com.example.demo.mapper.UserResponseMapper;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserResponseMapper userResponseMapper;

    public UserController(
            UserService userService,
            UserMapper userMapper,
            UserResponseMapper userResponseMapper) {

        this.userService = userService;
        this.userMapper = userMapper;
        this.userResponseMapper = userResponseMapper;
    }

    @GetMapping("/page")
    public ResponseEntity<Page<UserResponse>> getUsersWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "") String search) {
        page = Math.max(page, 0);
        size = Math.max(1, Math.min(size, 100));

        if (!Set.of("id", "name", "email", "createdAt").contains(sortBy)) {
            sortBy = "id";
        }


        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserResponse> response;

        if (search.isBlank()) {
            response = userService
                    .getUsersWithPagination(pageable)
                    .map(userMapper::toUserResponse);
        } else {
            response = userService
                    .searchUsers(search, pageable)
                    .map(userMapper::toUserResponse);
        }

        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        User user = userService.getUserById(id);

        return ResponseEntity.ok(
                userMapper.toUserResponse(user)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody User updatedUser) {

        User user = userService.updateUser(id, updatedUser);

        return ResponseEntity.ok(
                userMapper.toUserResponse(user)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userService.getUserByEmail(email);

        return ResponseEntity.ok(
                userResponseMapper.toResponse(user)
        );
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        String email = authentication.getName();

        User user = userService.updateMyProfile(
                email,
                request
        );

        return ResponseEntity.ok(
                userMapper.toUserResponse(user)
        );
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        String email = authentication.getName();

        userService.changePassword(
                email,
                request
        );

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/permissions/{permissionId}")
    public ResponseEntity<UserResponse> assignPermission(
            @PathVariable Long userId,
            @PathVariable Long permissionId) {

        User user = userService.assignPermission(
                userId,
                permissionId
        );

        return ResponseEntity.ok(
                userMapper.toUserResponse(user)
        );
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{userId}/permissions")
    public ResponseEntity<Set<PermissionResponse>> getUserPermissions(
            @PathVariable Long userId) {

        Set<PermissionResponse> response =
                userService.getUserPermissions(userId)
                        .stream()
                        .map(permission -> new PermissionResponse(
                                permission.getId(),
                                permission.getName()
                        ))
                        .collect(Collectors.toSet());

        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/profile-image")
    public ResponseEntity<String> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        String email = authentication.getName();

        User user = userService.uploadProfileImage(
                email,
                file
        );

        return ResponseEntity.ok(user.getProfileImage());
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/filter")
    public ResponseEntity<Page<UserResponse>> filterUsers(
            @RequestBody UserFilterRequest request,
            Pageable pageable) {

        return ResponseEntity.ok(
                userService.filterUsers(request, pageable)
        );
    }

}