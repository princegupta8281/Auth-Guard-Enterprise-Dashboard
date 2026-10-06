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

    private record RegistrationPayload(String name, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }
}
