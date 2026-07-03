package com.granturismo.garage.repository;

import com.granturismo.garage.domain.Car;
import com.granturismo.garage.domain.Drivetrain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findByBrandIdOrderByNameAsc(Long brandId);

    List<Car> findByCountryIdOrderByNameAsc(Long countryId);

    @Query("""
            select c from Car c
            where (:brandId is null or c.brand.id = :brandId)
              and (:countryId is null or c.country.id = :countryId)
              and (:minYear is null or c.creationYear >= :minYear)
              and (:maxYear is null or c.creationYear <= :maxYear)
              and (:minHp is null or c.horsepower >= :minHp)
              and (:maxHp is null or c.horsepower <= :maxHp)
              and (:drivetrain is null or c.drivetrain = :drivetrain)
            order by c.name asc
            """)
    List<Car> search(
            @Param("brandId") Long brandId,
            @Param("countryId") Long countryId,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear,
            @Param("minHp") Integer minHp,
            @Param("maxHp") Integer maxHp,
            @Param("drivetrain") Drivetrain drivetrain
    );
}
