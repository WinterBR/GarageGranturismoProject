package com.granturismo.garage.dto;

import com.granturismo.garage.domain.Drivetrain;
import com.granturismo.garage.domain.EngineLayout;
import jakarta.validation.constraints.*;

public class CarDto {

    /**
     * Payload used to create or update a car.
     * Country is intentionally not part of the request: it is always
     * derived server-side from the chosen brand's country.
     */
    public record Request(
            @NotBlank(message = "name is required")
            @Size(max = 120, message = "name must be at most 120 characters")
            String name,

            @NotNull(message = "brandId is required")
            Long brandId,

            @NotBlank(message = "colorHex is required")
            @Pattern(
                regexp = "^#([A-Fa-f0-9]{6})(:\\d{1,3}(;#[A-Fa-f0-9]{6}:\\d{1,3})*)?$",
                message = "colorHex must be a hex color like #C40233 or a multi-band string like #FFFFFF:60;#C40233:40"
            )
            String colorHex,

            @NotNull(message = "creationYear is required")
            @Min(value = 1885, message = "creationYear must be a realistic automobile year")
            @Max(value = 2100, message = "creationYear must be a realistic automobile year")
            Integer creationYear,

            @NotNull(message = "horsepower is required")
            @Positive(message = "horsepower must be positive")
            Integer horsepower,

            @NotNull(message = "drivetrain is required")
            Drivetrain drivetrain,

            @NotNull(message = "torqueNm is required")
            @Positive(message = "torqueNm must be positive")
            Integer torqueNm,

            @NotNull(message = "rpmMax is required")
            @Positive(message = "rpmMax must be positive")
            Integer rpmMax,

            @NotBlank(message = "engineName is required")
            @Size(max = 100, message = "engineName must be at most 100 characters")
            String engineName,

            @NotNull(message = "engineLayout is required")
            EngineLayout engineLayout,

            @NotNull(message = "weightKg is required")
            @Positive(message = "weightKg must be positive")
            Integer weightKg,

            @NotNull(message = "heightMm is required")
            @Positive(message = "heightMm must be positive")
            Integer heightMm,

            @NotNull(message = "lengthMm is required")
            @Positive(message = "lengthMm must be positive")
            Integer lengthMm,

            @NotNull(message = "widthMm is required")
            @Positive(message = "widthMm must be positive")
            Integer widthMm,

            /** Optional Wikipedia / wiki URL. */
            @Size(max = 512, message = "wikiUrl must be at most 512 characters")
            String wikiUrl,

            /** Optional racing category. */
            @Size(max = 100, message = "category must be at most 100 characters")
            String category
    ) {}

    /** Payload returned to clients. */
    public record Response(
            Long id,
            String name,
            BrandDto.Response brand,
            CountryDto.Response country,
            String colorHex,
            Integer creationYear,
            Integer horsepower,
            Drivetrain drivetrain,
            String drivetrainDescription,
            Integer torqueNm,
            Integer rpmMax,
            String engineName,
            EngineLayout engineLayout,
            String engineLayoutDescription,
            Integer weightKg,
            Dimensions dimensions,
            String wikiUrl,
            String category
    ) {}

    /** Grouped dimensions, in millimeters. */
    public record Dimensions(
            Integer heightMm,
            Integer lengthMm,
            Integer widthMm
    ) {}
}
