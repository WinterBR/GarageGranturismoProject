package com.granturismo.garage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BrandDto {

    /** Payload used to create or update a brand. */
    public record Request(
            @NotBlank(message = "name is required")
            @Size(max = 80, message = "name must be at most 80 characters")
            String name,

            @Size(max = 120, message = "logoFileName must be at most 120 characters")
            String logoFileName,

            @NotNull(message = "countryId is required")
            Long countryId
    ) {}

    /** Payload returned to clients. */
    public record Response(
            Long id,
            String name,
            String logoFileName,
            String logoUrl,
            CountryDto.Response country
    ) {}
}
