package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner loadData(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            TicketRepository ticketRepository,
            AppointmentRepository appointmentRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                // Seed Admin
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole(Role.ADMIN);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                
                // Seed Standard User
                User user1 = new User();
                user1.setName("John Doe");
                user1.setEmail("john@example.com");
                user1.setPassword(passwordEncoder.encode("password"));
                user1.setRole(Role.USER);
                user1.setEmailVerified(true);
                userRepository.save(user1);

                User user2 = new User();
                user2.setName("Jane Smith");
                user2.setEmail("jane@example.com");
                user2.setPassword(passwordEncoder.encode("password"));
                user2.setRole(Role.USER);
                user2.setEmailVerified(true);
                userRepository.save(user2);

                System.out.println("Users seeded: admin@example.com, john@example.com, jane@example.com");

                // Seed Projects
                Project p1 = new Project();
                p1.setName("Website Redesign");
                p1.setDescription("Revamping the corporate website for better UX and performance.");
                p1.setStatus("IN_PROGRESS");
                p1.setDueDate(LocalDate.now().plusDays(30));
                p1.setOwner(admin);
                projectRepository.save(p1);

                Project p2 = new Project();
                p2.setName("Mobile App Beta");
                p2.setDescription("Testing the new mobile app before public launch.");
                p2.setStatus("PLANNING");
                p2.setDueDate(LocalDate.now().plusDays(60));
                p2.setOwner(user1);
                projectRepository.save(p2);

                Project p3 = new Project();
                p3.setName("Q4 Marketing Campaign");
                p3.setDescription("Prepare assets and analytics for Q4.");
                p3.setStatus("DONE");
                p3.setDueDate(LocalDate.now().minusDays(5));
                p3.setOwner(user2);
                projectRepository.save(p3);

                // Seed Tasks
                List<Task> tasks = Arrays.asList(
                    createTask("Design Homepage Mockups", "todo", "High", "Oct 12", admin),
                    createTask("Setup Authentication API", "in_progress", "Critical", "Oct 15", admin),
                    createTask("Write Unit Tests", "review", "Medium", "Oct 18", user1),
                    createTask("Fix Navbar CSS", "done", "Low", "Oct 05", user2),
                    createTask("Prepare Slide Deck", "todo", "Medium", "Oct 20", admin),
                    createTask("Optimize Database Queries", "in_progress", "High", "Oct 25", user1)
                );
                taskRepository.saveAll(tasks);

                // Seed Tickets
                Ticket t1 = new Ticket();
                t1.setTitle("Login page not loading on mobile");
                t1.setDescription("When I try to login from my iPhone, the screen goes blank.");
                t1.setPriority(TicketPriority.HIGH);
                t1.setStatus(TicketStatus.OPEN);
                t1.setUser(user1);
                ticketRepository.save(t1);

                Ticket t2 = new Ticket();
                t2.setTitle("How do I update my billing info?");
                t2.setDescription("I cannot find the billing section in the dashboard.");
                t2.setPriority(TicketPriority.LOW);
                t2.setStatus(TicketStatus.CLOSED);
                t2.setUser(user2);
                ticketRepository.save(t2);

                Ticket t3 = new Ticket();
                t3.setTitle("Server 500 error on checkout");
                t3.setDescription("We are losing customers because checkout is failing.");
                t3.setPriority(TicketPriority.CRITICAL);
                t3.setStatus(TicketStatus.IN_PROGRESS);
                t3.setUser(user1);
                ticketRepository.save(t3);

                // Seed Appointments
                Appointment a1 = new Appointment();
                a1.setDoctorName("Dr. Sarah Jenkins - Tech Consultation");
                a1.setAppointmentDate(LocalDate.now().plusDays(2).toString());
                a1.setStatus("Confirmed");
                a1.setUser(admin);
                appointmentRepository.save(a1);

                Appointment a2 = new Appointment();
                a2.setDoctorName("Project Sync with Design Team");
                a2.setAppointmentDate(LocalDate.now().plusDays(4).toString());
                a2.setStatus("Pending");
                a2.setUser(user1);
                appointmentRepository.save(a2);

                Appointment a3 = new Appointment();
                a3.setDoctorName("Quarterly Review HR");
                a3.setAppointmentDate(LocalDate.now().minusDays(1).toString());
                a3.setStatus("Completed");
                a3.setUser(admin);
                appointmentRepository.save(a3);

                System.out.println("Dummy projects, tasks, tickets, and appointments seeded successfully!");
            }
        };
    }

    private Task createTask(String title, String columnId, String priority, String dateStr, User user) {
        Task t = new Task();
        t.setTitle(title);
        t.setColumnId(columnId);
        t.setPriority(priority);
        t.setDateStr(dateStr);
        t.setUser(user);
        return t;
    }
}
