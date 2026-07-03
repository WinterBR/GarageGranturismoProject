package com.granturismo.garage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CountryDto {

    /** Payload used to create or update a country. */
    public record Request(
            @NotBlank(message = "name is required")
            @Size(max = 80, message = "name must be at most 80 characters")
            String name,

            @Size(min = 3, max = 3, message = "isoCode must be exactly 3 characters, e.g. 'JPN'")
            String isoCode
    ) {}

    /** Payload returned to clients. */
    public record Response(
            Long id,
            String name,
            String isoCode
    ) {}
}
