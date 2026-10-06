import os

base = 'src/main/java/com/example/demo'

files = {
  'model/Ticket.java': """package com.example.demo.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = TicketStatus.OPEN;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
""",
  'model/TicketStatus.java': """package com.example.demo.model;
public enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED, CLOSED }""",
  'model/TicketPriority.java': """package com.example.demo.model;
public enum TicketPriority { LOW, MEDIUM, HIGH, CRITICAL }""",
  'model/TicketMessage.java': """package com.example.demo.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ticket_messages")
public class TicketMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}""",
  'repository/TicketRepository.java': """package com.example.demo.repository;
import com.example.demo.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}""",
  'repository/TicketMessageRepository.java': """package com.example.demo.repository;
import com.example.demo.model.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}""",
  'controller/TicketController.java': """package com.example.demo.controller;
import com.example.demo.model.*;
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
            .stream().map(m -> Map.of(
                "id", m.getId(),
                "message", m.getMessage(),
                "senderName", m.getSender().getName(),
                "senderRole", m.getSender().getRole().name(),
                "createdAt", m.getCreatedAt()
            )).collect(Collectors.toList());
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
        return new java.util.HashMap<>(Map.of(
            "id", t.getId(),
            "title", t.getTitle(),
            "description", t.getDescription(),
            "status", t.getStatus().name(),
            "priority", t.getPriority().name(),
            "createdAt", t.getCreatedAt(),
            "userName", t.getUser().getName(),
            "userEmail", t.getUser().getEmail()
        ));
    }
}"""
}

for filepath, content in files.items():
    full_path = os.path.join(base, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)

print("Helpdesk Backend generated successfully.")
