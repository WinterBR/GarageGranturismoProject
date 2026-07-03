package com.granturismo.garage.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.granturismo.garage.dto.AuthDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end checks for the JWT login flow: the single admin account must
 * be able to log in, every other endpoint must require the resulting
 * token, and refreshing must hand back a brand-new, equally valid token.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void unauthenticatedRequestToProtectedEndpointIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/cars"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        var badLogin = new AuthDto.LoginRequest("admin", "wrong-password");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void correctCredentialsReturnAWorkingToken() throws Exception {
        var login = new AuthDto.LoginRequest("admin", "user1234");

        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInMs").value(300000))
                .andReturn().getResponse().getContentAsString();

        AuthDto.TokenResponse token = objectMapper.readValue(body, AuthDto.TokenResponse.class);

        // The freshly issued token must actually unlock a protected endpoint.
        mockMvc.perform(get("/api/v1/cars")
                        .header("Authorization", "Bearer " + token.token()))
                .andExpect(status().isOk());
    }

    @Test
    void refreshIssuesANewValidToken() throws Exception {
        var login = new AuthDto.LoginRequest("admin", "user1234");

        String loginBody = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andReturn().getResponse().getContentAsString();
        AuthDto.TokenResponse original = objectMapper.readValue(loginBody, AuthDto.TokenResponse.class);

        String refreshBody = mockMvc.perform(post("/api/v1/auth/refresh")
                        .header("Authorization", "Bearer " + original.token()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        AuthDto.TokenResponse refreshed = objectMapper.readValue(refreshBody, AuthDto.TokenResponse.class);

        mockMvc.perform(get("/api/v1/cars")
                        .header("Authorization", "Bearer " + refreshed.token()))
                .andExpect(status().isOk());
    }

    @Test
    void refreshWithoutATokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }
}
