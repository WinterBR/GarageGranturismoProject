package com.granturismo.garage.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds the {@code app.security.*} properties from application.yml.
 * There is a single hard-coded admin user for this application; no user
 * table, no registration, no password reset. Just one set of credentials,
 * configured here, used to mint JWTs.
 */
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private final Admin admin = new Admin();
    private final Jwt jwt = new Jwt();

    public Admin getAdmin() { return admin; }
    public Jwt getJwt()     { return jwt; }

    @Getter @Setter
    public static class Admin {
        private String username;
        private String passwordHash;
    }

    @Getter @Setter
    public static class Jwt {
        private String secret;
        private long expirationMs;
    }
}
