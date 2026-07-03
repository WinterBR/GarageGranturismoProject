package com.granturismo.garage;

import com.granturismo.garage.config.SecurityProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Garage microservice — inspired by the Gran Turismo 4 car list screen.
 * <p>
 * Exposes Countries, Brands and Cars, with full technical specs
 * (power, torque, drivetrain, engine layout, weight and dimensions).
 * <p>
 * Tries to connect to PostgreSQL first; if it's unreachable, it
 * automatically falls back to an in-memory H2 database so the
 * service always starts. See {@code DataSourceFallbackConfig}.
 * <p>
 * The API is protected end-to-end by a single-user JWT login
 * (see {@code SecurityConfig}, {@code AuthController}).
 */
@SpringBootApplication
@EnableConfigurationProperties(SecurityProperties.class)
public class GarageServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GarageServiceApplication.class, args);
    }
}
