package com.example.demo.controller;

import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final Set<String> STATUSES = Set.of("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED");

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listProjects(@AuthenticationPrincipal String email) {
        User owner = findUser(email);
        return ResponseEntity.ok(projectRepository.findByOwnerIdOrderByIdDesc(owner.getId())
                .stream()
                .map(this::toDto)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProject(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        User owner = findUser(email);
        return ResponseEntity.ok(toDto(findOwnedProject(id, owner)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProject(
            @AuthenticationPrincipal String email,
            @RequestBody Map<String, String> payload) {
        User owner = findUser(email);
        Project project = new Project();
        project.setOwner(owner);
        project.setName(requiredText(payload, "name"));
        project.setDescription(optionalText(payload, "description"));
        project.setStatus(status(payload.get("status")));
        project.setDueDate(parseDueDate(payload.get("dueDate")));
        return ResponseEntity.ok(toDto(projectRepository.save(project)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProject(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        User owner = findUser(email);
        Project project = findOwnedProject(id, owner);

        if (payload.containsKey("name")) {
            project.setName(requiredText(payload, "name"));
        }
        if (payload.containsKey("description")) {
            project.setDescription(optionalText(payload, "description"));
        }
        if (payload.containsKey("status")) {
            project.setStatus(status(payload.get("status")));
        }
        if (payload.containsKey("dueDate")) {
            project.setDueDate(parseDueDate(payload.get("dueDate")));
        }
        return ResponseEntity.ok(toDto(projectRepository.save(project)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        User owner = findUser(email);
        projectRepository.delete(findOwnedProject(id, owner));
        return ResponseEntity.noContent().build();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Project findOwnedProject(Long id, User owner) {
        return projectRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private String requiredText(Map<String, String> payload, String key) {
        String value = payload.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return value.strip();
    }

    private String optionalText(Map<String, String> payload, String key) {
        String value = payload.get(key);
        return value == null || value.isBlank() ? null : value.strip();
    }

    private String status(String value) {
        String normalized = value == null || value.isBlank()
                ? "PLANNING"
                : value.strip().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid project status");
        }
        return normalized;
    }

    private LocalDate parseDueDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Due date must use YYYY-MM-DD format");
        }
    }

    private Map<String, Object> toDto(Project project) {
        return Map.of(
                "id", project.getId(),
                "name", project.getName(),
                "description", project.getDescription() == null ? "" : project.getDescription(),
                "status", project.getStatus(),
                "dueDate", project.getDueDate() == null ? "" : project.getDueDate().toString());
    }
}
