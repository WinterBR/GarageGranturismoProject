package com.granturismo.garage.mapper;

import com.granturismo.garage.domain.Car;
import com.granturismo.garage.dto.CarDto;
import org.springframework.stereotype.Component;

@Component
public class CarMapper {

    private final BrandMapper brandMapper;
    private final CountryMapper countryMapper;

    public CarMapper(BrandMapper brandMapper, CountryMapper countryMapper) {
        this.brandMapper = brandMapper;
        this.countryMapper = countryMapper;
    }

    public CarDto.Response toResponse(Car car) {
        if (car == null) {
            return null;
        }
        return new CarDto.Response(
                car.getId(),
                car.getName(),
                brandMapper.toResponse(car.getBrand()),
                countryMapper.toResponse(car.getCountry()),
                car.getColorHex(),
                car.getCreationYear(),
                car.getHorsepower(),
                car.getDrivetrain(),
                car.getDrivetrain() != null ? car.getDrivetrain().getDescription() : null,
                car.getTorqueNm(),
                car.getRpmMax(),
                car.getEngineName(),
                car.getEngineLayout(),
                car.getEngineLayout() != null ? car.getEngineLayout().getDescription() : null,
                car.getWeightKg(),
                new CarDto.Dimensions(car.getHeightMm(), car.getLengthMm(), car.getWidthMm()),
                car.getWikiUrl(),
                car.getCategory()
        );
    }
}
