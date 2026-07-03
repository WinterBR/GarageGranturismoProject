package com.granturismo.garage.mapper;

import com.granturismo.garage.domain.Country;
import com.granturismo.garage.dto.CountryDto;
import org.springframework.stereotype.Component;

@Component
public class CountryMapper {

    public CountryDto.Response toResponse(Country country) {
        if (country == null) {
            return null;
        }
        return new CountryDto.Response(
                country.getId(),
                country.getName(),
                country.getIsoCode()
        );
    }
}
