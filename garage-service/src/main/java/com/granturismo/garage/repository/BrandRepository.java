package com.granturismo.garage.repository;

import com.granturismo.garage.domain.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    List<Brand> findByCountryIdOrderByNameAsc(Long countryId);

    boolean existsByNameIgnoreCase(String name);
}
