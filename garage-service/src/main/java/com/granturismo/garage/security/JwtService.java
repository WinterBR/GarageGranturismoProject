package com.granturismo.garage.security;

import com.granturismo.garage.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

/**
 * Mints and validates the application's JWTs.
 *
 * Tokens are short-lived (5 minutes by default, see app.security.jwt.expiration-ms).
 * There is no refresh token / rotation scheme: the frontend simply calls the
 * same login-issued credentials again before the token expires (see
 * AuthController#refresh), which is enough for a single-user internal tool.
 */
@Service
public class JwtService {

    private final SecurityProperties properties;
    private final SecretKey signingKey;

    public JwtService(SecurityProperties properties) {
        this.properties = properties;
        this.signingKey = resolveSigningKey(properties.getJwt().getSecret());
    }

    private SecretKey resolveSigningKey(String secret) {
        byte[] keyBytes;
        try {
            // Secret is configured as base64 (see application.yml).
            keyBytes = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException ex) {
            // Fallback: treat it as a raw UTF-8 string instead of failing startup.
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Generates a fresh token for the given username, valid for expiration-ms. */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + properties.getJwt().getExpirationMs());
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /** How many milliseconds a freshly issued token stays valid for. Exposed so the API can tell the client. */
    public long getExpirationMs() {
        return properties.getJwt().getExpirationMs();
    }

    /** Returns the username embedded in the token, or null if the token is missing/invalid/expired. */
    public String extractUsername(String token) {
        Claims claims = parseClaims(token);
        return claims == null ? null : claims.getSubject();
    }

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            // Invalid signature, malformed token, or expired: all treated as "not authenticated".
            return null;
        }
    }
}
