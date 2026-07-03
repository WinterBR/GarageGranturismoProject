package com.granturismo.garage.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * A car manufacturer / brand, e.g. Toyota, Ferrari, BMW.
 * Always linked to its country of origin.
 */
@Entity
@Table(name = "brands", uniqueConstraints = {
        @UniqueConstraint(name = "uk_brands_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Builder
@ToString
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    /**
     * File name of the brand logo, shipped under
     * src/main/resources/images/brands/. Served via BrandController
     * (GET /api/v1/brands/{id}/logo) through BrandLogoService.
     */
    @Column(name = "logo_file_name", length = 120)
    private String logoFileName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Builder.Default
    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Car> cars = new ArrayList<>();
}
