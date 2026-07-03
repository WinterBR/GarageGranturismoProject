package com.granturismo.garage;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Smoke test: verifies the whole Spring context loads correctly.
 * Since no real PostgreSQL is available in the test environment,
 * this also exercises the automatic fallback to H2.
 */
@SpringBootTest
class GarageServiceApplicationTests {

    @Test
    void contextLoads() {
        // If the context fails to load, this test fails.
        // Validates: entity mappings, repositories, services, controllers,
        // DataSource fallback logic and data.sql seed script all work together.
    }
}
