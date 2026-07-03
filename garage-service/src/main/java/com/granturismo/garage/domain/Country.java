package com.granturismo.garage.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * A country of origin for a car manufacturer (brand).
 * e.g. Japan, Germany, Italy, United Kingdom, United States...
 */
@Entity
@Table(name = "countries", uniqueConstraints = {
        @UniqueConstraint(name = "uk_countries_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Builder
@ToString
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    /** ISO 3166-1 alpha-3 code, e.g. "JPN", "DEU", "ITA", "GBR", "USA". */
    @Column(name = "iso_code", length = 3)
    private String isoCode;

    @Builder.Default
    @OneToMany(mappedBy = "country", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Brand> brands = new ArrayList<>();
}
