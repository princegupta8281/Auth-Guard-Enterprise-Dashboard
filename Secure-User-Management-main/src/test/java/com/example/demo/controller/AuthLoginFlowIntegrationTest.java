package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthLoginFlowIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private JavaMailSender javaMailSender;

    @Test
    void loginReturnsDatabaseGeneratedUserIdAndProfileAcceptsTheToken() throws Exception {
        String email = "login-flow-" + UUID.randomUUID() + "@example.com";
        String password = "secure-password";

        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegistrationPayload("Login Flow User", email, password))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();

        long generatedId = objectMapper.readTree(
                registration.getResponse().getContentAsString()).path("id").asLong();
        User storedUser = userRepository.findByEmail(email).orElseThrow();
        if (generatedId <= 0 || generatedId != storedUser.getId()) {
            throw new AssertionError("Registration did not persist the generated user ID");
        }

        mockMvc.perform(get("/api/auth/verify")
                        .param("token", storedUser.getVerificationToken()))
                .andExpect(status().isOk());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginPayload(email, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.userId").value(generatedId))
                .andExpect(jsonPath("$.email").value(email))
                .andReturn();

        JsonNode loginResponse = objectMapper.readTree(login.getResponse().getContentAsString());
        String jwt = loginResponse.path("token").asText();

        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(generatedId))
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void authenticatedUserCanCreateReadUpdateAndDeleteProjects() throws Exception {
        String email = "project-crud-" + UUID.randomUUID() + "@example.com";
        String password = "secure-password";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegistrationPayload("Project Owner", email, password))))
                .andExpect(status().isCreated());

        User storedUser = userRepository.findByEmail(email).orElseThrow();
        mockMvc.perform(get("/api/auth/verify")
                        .param("token", storedUser.getVerificationToken()))
                .andExpect(status().isOk());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        String jwt = objectMapper.readTree(login.getResponse().getContentAsString()).path("token").asText();

        MvcResult created = mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Release","description":"Initial plan","status":"ACTIVE","dueDate":"2026-11-01"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Release"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn();

        long projectId = objectMapper.readTree(created.getResponse().getContentAsString()).path("id").asLong();
        mockMvc.perform(get("/api/projects")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(projectId));
        mockMvc.perform(get("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Initial plan"));

        mockMvc.perform(put("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Release 2","description":"Updated plan","status":"COMPLETED","dueDate":""}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Release 2"))
                .andExpect(jsonPath("$.dueDate").value(""));

        mockMvc.perform(delete("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNotFound());

        MvcResult createdTask = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Review release","columnId":"todo","priority":"High","dateStr":"Nov 1"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Review release"))
                .andReturn();
        long taskId = objectMapper.readTree(createdTask.getResponse().getContentAsString()).path("id").asLong();
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].column").value("todo"));
        mockMvc.perform(put("/api/tasks/{id}", taskId)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Ship release","columnId":"done","priority":"Medium"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Ship release"))
                .andExpect(jsonPath("$.column").value("done"));
        mockMvc.perform(delete("/api/tasks/{id}", taskId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Release issue","description":"Details","priority":"URGENT"}
                                """))
                .andExpect(status().isBadRequest());

        MvcResult createdTicket = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Release issue","description":"Details","priority":"LOW"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value("LOW"))
                .andReturn();
        long ticketId = objectMapper.readTree(createdTicket.getResponse().getContentAsString()).path("id").asLong();
        mockMvc.perform(post("/api/tickets/{id}/messages", ticketId)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message":"Please check the deployment log."}
                                """))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/tickets/{id}", ticketId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages[0].message").value("Please check the deployment log."));
    }

    private record RegistrationPayload(String name, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }
}
