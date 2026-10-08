package com.example.demo.controller;

import com.example.demo.entity.Task;
import com.example.demo.entity.User;
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

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getTasks(@AuthenticationPrincipal String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
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
        User user = userRepository.findByEmail(email).orElseThrow();
        Task task = new Task();
        task.setUser(user);
        task.setTitle(payload.get("title"));
        task.setColumnId(payload.getOrDefault("columnId", "todo"));
        task.setPriority(payload.getOrDefault("priority", "Medium"));
        task.setDateStr(payload.getOrDefault("dateStr", "Today"));
        taskRepository.save(task);
        return ResponseEntity.ok(toDTO(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        if (payload.containsKey("title")) task.setTitle(payload.get("title"));
        if (payload.containsKey("columnId")) task.setColumnId(payload.get("columnId"));
        if (payload.containsKey("priority")) task.setPriority(payload.get("priority"));
        if (payload.containsKey("dateStr")) task.setDateStr(payload.get("dateStr"));
        
        taskRepository.save(task);
        return ResponseEntity.ok(toDTO(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
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
}
