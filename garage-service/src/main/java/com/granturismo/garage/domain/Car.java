package com.granturismo.garage.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * A car in the garage, with full Gran-Turismo-style technical specs:
 * brand/country, color, year, power, drivetrain, torque, RPM, engine,
 * weight and dimensions.
 */
@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    /**
     * Denormalized link to the country, derived from the brand's country.
     * Kept on the car too so queries like "all cars from Japan" don't
     * always need to join through brand. Always kept in sync with
     * brand.getCountry() by the service layer.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    /**
     * Car color: either a plain hex "#C40233" or a multi-band livery
     * string "#RRGGBB:pct;#RRGGBB:pct;..." (up to 4 bands, ~47 chars max).
     * The frontend renders this as a vertically-split colored rectangle.
     */
    @Column(name = "color_hex", nullable = false, length = 100)
    private String colorHex;

    @Column(name = "creation_year", nullable = false)
    private Integer creationYear;

    @Column(name = "horsepower", nullable = false)
    private Integer horsepower;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Drivetrain drivetrain;

    @Column(name = "torque_nm", nullable = false)
    private Integer torqueNm;

    @Column(name = "rpm_max", nullable = false)
    private Integer rpmMax;

    /** Engine model / commercial name, e.g. "Coyote", "Quad-Turbo W16". */
    @Column(name = "engine_name", nullable = false, length = 100)
    private String engineName;

    /** Engine cylinder layout, e.g. V8, V16, W16, FLAT6, ELECTRIC. */
    @Enumerated(EnumType.STRING)
    @Column(name = "engine_layout", nullable = false, length = 12)
    private EngineLayout engineLayout;

    @Column(name = "weight_kg", nullable = false)
    private Integer weightKg;

    @Column(name = "height_mm", nullable = false)
    private Integer heightMm;

    @Column(name = "length_mm", nullable = false)
    private Integer lengthMm;

    @Column(name = "width_mm", nullable = false)
    private Integer widthMm;

    /** Optional Wikipedia / wiki link for this car. */
    @Column(name = "wiki_url", length = 512)
    private String wikiUrl;

    /** Optional racing category (e.g. "Fórmula 1", "GT3", "LMH / LMDh"). */
    @Column(name = "category", length = 100)
    private String category;
}
