package com.example.demo.controller;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Locale;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    @Autowired private TicketRepository ticketRepository;
    @Autowired private TicketMessageRepository messageRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserTickets(@AuthenticationPrincipal String email) {
        User user = findUser(email);
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(ticketRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@AuthenticationPrincipal String email, @RequestBody Map<String, String> payload) {
        User user = findUser(email);
        Ticket t = new Ticket();
        t.setUser(user);
        t.setTitle(requiredText(payload, "title"));
        t.setDescription(requiredText(payload, "description"));
        
        String priorityStr = payload.get("priority");
        t.setPriority(parsePriority(priorityStr));
        ticketRepository.save(t);
        return ResponseEntity.ok(toDTO(t));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@AuthenticationPrincipal String email, @PathVariable Long id) {
        Ticket t = findTicket(id);
        User user = findUser(email);
        
        if (user.getRole() != Role.ADMIN && !t.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        Map<String, Object> dto = toDTO(t);
        List<Map<String, Object>> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(id)
            .stream().map(m -> {
                Map<String, Object> msg = new java.util.HashMap<>();
                msg.put("id", m.getId());
                msg.put("message", m.getMessage());
                msg.put("senderName", m.getSender().getName());
                msg.put("senderRole", m.getSender().getRole().name());
                msg.put("createdAt", m.getCreatedAt());
                return msg;
            }).collect(Collectors.toList());
        dto.put("messages", messages);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> addMessage(@AuthenticationPrincipal String email, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = findUser(email);
        Ticket t = findTicket(id);
        
        if (user.getRole() != Role.ADMIN && !t.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        TicketMessage m = new TicketMessage();
        m.setTicket(t);
        m.setSender(user);
        m.setMessage(requiredText(payload, "message"));
        messageRepository.save(m);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@AuthenticationPrincipal String email, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = findUser(email);
        if (user.getRole() != Role.ADMIN) return ResponseEntity.status(403).build();

        Ticket t = findTicket(id);
        String statusStr = requiredText(payload, "status");
        try {
            t.setStatus(TicketStatus.valueOf(statusStr.toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid ticket status");
        }
        ticketRepository.save(t);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private Map<String, Object> toDTO(Ticket t) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", t.getId());
        map.put("title", t.getTitle());
        map.put("description", t.getDescription());
        map.put("status", t.getStatus().name());
        map.put("priority", t.getPriority().name());
        map.put("createdAt", t.getCreatedAt());
        map.put("userName", t.getUser().getName());
        map.put("userEmail", t.getUser().getEmail());
        return map;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Ticket findTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    private String requiredText(Map<String, String> payload, String key) {
        String value = payload.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return value.strip();
    }

    private TicketPriority parsePriority(String value) {
        try {
            return TicketPriority.valueOf(value == null || value.isBlank()
                    ? "LOW"
                    : value.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid ticket priority");
        }
    }
}
