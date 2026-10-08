package com.example.demo.controller;

import com.example.demo.entity.Task;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Set<String> COLUMNS = Set.of("todo", "in_progress", "review", "done");
    private static final Set<String> PRIORITIES = Set.of("Low", "Medium", "High");

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getTasks(@AuthenticationPrincipal String email) {
        User user = findUser(email);
        List<Map<String, Object>> tasks = taskRepository.findByUserId(user.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(
            @AuthenticationPrincipal String email,
            @RequestBody Map<String, String> payload) {
        User user = findUser(email);
        Task task = new Task();
        task.setUser(user);
        task.setTitle(requiredText(payload, "title"));
        task.setColumnId(normalizeColumn(payload.getOrDefault("columnId", "todo")));
        task.setPriority(normalizePriority(payload.getOrDefault("priority", "Medium")));
        String date = payload.get("dateStr");
        task.setDateStr(date == null || date.isBlank() ? "Today" : date.strip());
        taskRepository.save(task);
        return ResponseEntity.ok(toDTO(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        User user = findUser(email);
        Task task = findOwnedTask(id, user);
        
        if (payload.containsKey("title")) task.setTitle(requiredText(payload, "title"));
        if (payload.containsKey("columnId")) task.setColumnId(normalizeColumn(payload.get("columnId")));
        if (payload.containsKey("priority")) task.setPriority(normalizePriority(payload.get("priority")));
        if (payload.containsKey("dateStr")) task.setDateStr(payload.get("dateStr") == null ? "" : payload.get("dateStr").strip());
        
        taskRepository.save(task);
        return ResponseEntity.ok(toDTO(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        User user = findUser(email);
        Task task = findOwnedTask(id, user);
        taskRepository.delete(task);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private Map<String, Object> toDTO(Task t) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", t.getId());
        map.put("title", t.getTitle());
        map.put("column", t.getColumnId());
        map.put("priority", t.getPriority());
        map.put("date", t.getDateStr());
        return map;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Task findOwnedTask(Long id, User owner) {
        return taskRepository.findByIdAndUserId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private String requiredText(Map<String, String> payload, String key) {
        String value = payload.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return value.strip();
    }

    private String normalizeColumn(String value) {
        String column = value == null ? "" : value.strip().toLowerCase(Locale.ROOT);
        if (!COLUMNS.contains(column)) {
            throw new IllegalArgumentException("Invalid task status column");
        }
        return column;
    }

    private String normalizePriority(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Priority is required");
        }
        String priority = value.strip().toLowerCase(Locale.ROOT);
        return PRIORITIES.stream()
                .filter(candidate -> candidate.toLowerCase(Locale.ROOT).equals(priority))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid task priority"));
    }
}
