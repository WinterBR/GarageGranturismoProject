package com.granturismo.garage.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI garageOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Garage Service API")
                        .description("Microservice for managing a car garage — countries, brands and cars, " +
                                "with full technical specs (power, torque, drivetrain, engine, weight and " +
                                "dimensions). Inspired by the Gran Turismo 4 car list. " +
                                "Every endpoint except POST /api/v1/auth/login requires a Bearer JWT " +
                                "obtained from that endpoint.")
                        .version("1.0.0")
                        .contact(new Contact().name("Garage Service"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
