package com.granturismo.garage.service;

import com.granturismo.garage.config.SecurityProperties;
import com.granturismo.garage.dto.AuthDto;
import com.granturismo.garage.exception.InvalidCredentialsException;
import com.granturismo.garage.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authenticates the single hard-coded admin user and issues JWTs.
 * There is no user table: credentials are read straight from
 * app.security.admin.* (see application.yml / SecurityProperties).
 */
@Service
public class AuthService {

    private final SecurityProperties properties;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(SecurityProperties properties, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.properties = properties;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /** Validates credentials and returns a fresh token, or throws InvalidCredentialsException. */
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        String expectedUsername = properties.getAdmin().getUsername();

        boolean usernameMatches = expectedUsername.equals(request.username());
        // Always run the BCrypt check, even when the username is already wrong,
        // so the response time doesn't leak whether the username was valid
        // (a basic timing-attack mitigation).
        boolean passwordMatches = passwordEncoder.matches(request.password(), properties.getAdmin().getPasswordHash());

        if (!usernameMatches || !passwordMatches) {
            throw new InvalidCredentialsException("Invalid username or password.");
        }

        String token = jwtService.generateToken(expectedUsername);
        return AuthDto.TokenResponse.of(token, jwtService.getExpirationMs(), expectedUsername);
    }

    /**
     * Issues a brand-new token for whoever is already authenticated.
     * Called by the frontend every ~5 minutes, before the current token
     * expires, to keep the session alive without asking for the password
     * again.
     */
    public AuthDto.TokenResponse refresh(String currentUsername) {
        String token = jwtService.generateToken(currentUsername);
        return AuthDto.TokenResponse.of(token, jwtService.getExpirationMs(), currentUsername);
    }
}
