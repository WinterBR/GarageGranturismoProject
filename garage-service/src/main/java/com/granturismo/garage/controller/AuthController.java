package com.granturismo.garage.controller;

import com.granturismo.garage.dto.AuthDto;
import com.granturismo.garage.exception.InvalidCredentialsException;
import com.granturismo.garage.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Single-user JWT login. The only valid account is the configured admin user.")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with the admin username/password and receive a short-lived JWT")
    public AuthDto.TokenResponse login(@Valid @RequestBody AuthDto.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a still-valid token for a brand-new one, extending the session without re-entering the password")
    public AuthDto.TokenResponse refresh(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            // Defensive: SecurityConfig already requires authentication here,
            // so this should be unreachable, but fail loudly rather than NPE.
            throw new InvalidCredentialsException("No authenticated session to refresh.");
        }
        return authService.refresh(authentication.getName());
    }
}
