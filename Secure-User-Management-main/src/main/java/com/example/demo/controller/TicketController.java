package com.example.demo.controller;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    @Autowired private TicketRepository ticketRepository;
    @Autowired private TicketMessageRepository messageRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserTickets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(ticketRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Ticket t = new Ticket();
        t.setUser(user);
        t.setTitle(payload.get("title"));
        t.setDescription(payload.get("description"));
        t.setPriority(TicketPriority.valueOf(payload.getOrDefault("priority", "LOW")));
        ticketRepository.save(t);
        return ResponseEntity.ok(toDTO(t));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        Ticket t = ticketRepository.findById(id).orElseThrow();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
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
    public ResponseEntity<?> addMessage(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Ticket t = ticketRepository.findById(id).orElseThrow();
        
        if (user.getRole() != Role.ADMIN && !t.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        TicketMessage m = new TicketMessage();
        m.setTicket(t);
        m.setSender(user);
        m.setMessage(payload.get("message"));
        messageRepository.save(m);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (user.getRole() != Role.ADMIN) return ResponseEntity.status(403).build();

        Ticket t = ticketRepository.findById(id).orElseThrow();
        t.setStatus(TicketStatus.valueOf(payload.get("status")));
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
}
