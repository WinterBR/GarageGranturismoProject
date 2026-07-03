package com.granturismo.garage.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDto {

    /** Login payload: the only credentials accepted are admin / user1234. */
    public record LoginRequest(
            @NotBlank(message = "username is required")
            String username,

            @NotBlank(message = "password is required")
            String password
    ) {}

    /**
     * Token payload returned by both /api/auth/login and /api/auth/refresh.
     * expiresInMs tells the client exactly how long this token is valid for,
     * so the frontend can schedule its automatic refresh without guessing.
     */
    public record TokenResponse(
            String token,
            String tokenType,
            long expiresInMs,
            String username
    ) {
        public static TokenResponse of(String token, long expiresInMs, String username) {
            return new TokenResponse(token, "Bearer", expiresInMs, username);
        }
    }
}
