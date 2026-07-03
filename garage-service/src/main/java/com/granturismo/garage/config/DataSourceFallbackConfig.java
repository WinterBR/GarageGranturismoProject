package com.granturismo.garage.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Builds the application's DataSource with an automatic fallback:
 * <p>
 * 1. Tries to open a real JDBC connection to PostgreSQL using the
 *    configured URL (see application.yml — port 1883).
 * 2. If that fails for any reason (DB down, wrong port, network
 *    unreachable, auth failure, etc.) within a short timeout, it
 *    logs a warning and falls back to an in-memory H2 database
 *    instead of preventing the whole microservice from starting.
 * <p>
 * This means the service is always able to boot — handy for local
 * development, demos, or environments where Postgres isn't
 * provisioned yet.
 */
@Configuration
public class DataSourceFallbackConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceFallbackConfig.class);

    @Value("${app.datasource.postgres.url}")
    private String postgresUrl;

    @Value("${app.datasource.postgres.username}")
    private String postgresUsername;

    @Value("${app.datasource.postgres.password}")
    private String postgresPassword;

    @Value("${app.datasource.postgres.driver-class-name}")
    private String postgresDriver;

    @Value("${app.datasource.postgres.connection-timeout-ms:2000}")
    private int connectionTimeoutMs;

    @Value("${app.datasource.h2.url}")
    private String h2Url;

    @Value("${app.datasource.h2.username}")
    private String h2Username;

    @Value("${app.datasource.h2.password}")
    private String h2Password;

    @Value("${app.datasource.h2.driver-class-name}")
    private String h2Driver;

    @Bean
    public DataSource dataSource() {
        if (isPostgresReachable()) {
            log.info("PostgreSQL is reachable at {} — using PostgreSQL as the datasource.", postgresUrl);
            return buildHikariDataSource(postgresDriver, postgresUrl, postgresUsername, postgresPassword, "garage-postgres-pool");
        }

        log.warn("PostgreSQL is NOT reachable at {}. Falling back to in-memory H2 database. " +
                        "Data will NOT be persisted across restarts until PostgreSQL becomes available.",
                postgresUrl);
        return buildHikariDataSource(h2Driver, h2Url, h2Username, h2Password, "garage-h2-fallback-pool");
    }

    /**
     * Attempts a raw JDBC connection (bypassing the pool) with a short
     * timeout, purely to check reachability before committing to a pool.
     */
    private boolean isPostgresReachable() {
        try {
            Class.forName(postgresDriver);
            DriverManager.setLoginTimeout(Math.max(1, connectionTimeoutMs / 1000));

            Properties props = new Properties();
            props.setProperty("user", postgresUsername);
            props.setProperty("password", postgresPassword);
            props.setProperty("connectTimeout", String.valueOf(connectionTimeoutMs));
            props.setProperty("socketTimeout", String.valueOf(Math.max(1, connectionTimeoutMs / 1000)));

            try (Connection connection = DriverManager.getConnection(postgresUrl, props)) {
                return connection.isValid(Math.max(1, connectionTimeoutMs / 1000));
            }
        } catch (ClassNotFoundException | SQLException ex) {
            log.debug("PostgreSQL reachability check failed: {}", ex.getMessage());
            return false;
        } catch (Exception ex) {
            log.debug("Unexpected error while checking PostgreSQL reachability: {}", ex.getMessage());
            return false;
        }
    }

    private DataSource buildHikariDataSource(String driverClassName, String url, String username,
                                               String password, String poolName) {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driverClassName);
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setPoolName(poolName);
        config.setConnectionTimeout(Math.max(1000L, connectionTimeoutMs));
        config.setMaximumPoolSize(10);
        return new HikariDataSource(config);
    }
}
