package com.granturismo.garage.mapper;

import com.granturismo.garage.domain.Brand;
import com.granturismo.garage.dto.BrandDto;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    private final CountryMapper countryMapper;

    public BrandMapper(CountryMapper countryMapper) {
        this.countryMapper = countryMapper;
    }

    public BrandDto.Response toResponse(Brand brand) {
        if (brand == null) {
            return null;
        }
        String logoUrl = brand.getLogoFileName() != null
                ? "/api/v1/brands/" + brand.getId() + "/logo"
                : null;

        return new BrandDto.Response(
                brand.getId(),
                brand.getName(),
                brand.getLogoFileName(),
                logoUrl,
                countryMapper.toResponse(brand.getCountry())
        );
    }
}
