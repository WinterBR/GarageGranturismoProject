package com.granturismo.garage.service;

import com.granturismo.garage.domain.Brand;
import com.granturismo.garage.domain.Car;
import com.granturismo.garage.domain.Drivetrain;
import com.granturismo.garage.dto.CarDto;
import com.granturismo.garage.exception.ResourceNotFoundException;
import com.granturismo.garage.mapper.CarMapper;
import com.granturismo.garage.repository.CarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CarService {

    private final CarRepository carRepository;
    private final BrandService brandService;
    private final CarMapper carMapper;

    public CarService(CarRepository carRepository, BrandService brandService, CarMapper carMapper) {
        this.carRepository = carRepository;
        this.brandService = brandService;
        this.carMapper = carMapper;
    }

    @Transactional(readOnly = true)
    public CarDto.Response findById(Long id) {
        return carMapper.toResponse(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<CarDto.Response> findByBrand(Long brandId) {
        return carRepository.findByBrandIdOrderByNameAsc(brandId).stream()
                .map(carMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CarDto.Response> findByCountry(Long countryId) {
        return carRepository.findByCountryIdOrderByNameAsc(countryId).stream()
                .map(carMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CarDto.Response> search(Long brandId, Long countryId, Integer minYear, Integer maxYear,
                                         Integer minHp, Integer maxHp, Drivetrain drivetrain) {
        return carRepository.search(brandId, countryId, minYear, maxYear, minHp, maxHp, drivetrain).stream()
                .map(carMapper::toResponse)
                .toList();
    }

    public CarDto.Response create(CarDto.Request request) {
        Brand brand = brandService.getOrThrow(request.brandId());
        Car car = buildFromRequest(new Car(), request, brand);
        return carMapper.toResponse(carRepository.save(car));
    }

    public CarDto.Response update(Long id, CarDto.Request request) {
        Car car = getOrThrow(id);
        Brand brand = brandService.getOrThrow(request.brandId());
        car = buildFromRequest(car, request, brand);
        return carMapper.toResponse(carRepository.save(car));
    }

    public void delete(Long id) {
        Car car = getOrThrow(id);
        carRepository.delete(car);
    }

    Car getOrThrow(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Car", id));
    }

    /**
     * Applies request fields onto the entity. The car's country is always
     * derived from the brand's country — never taken from client input —
     * so a car can never be inconsistent with its manufacturer's origin.
     */
    private Car buildFromRequest(Car car, CarDto.Request request, Brand brand) {
        car.setName(request.name());
        car.setBrand(brand);
        car.setCountry(brand.getCountry());
        car.setColorHex(request.colorHex());
        car.setCreationYear(request.creationYear());
        car.setHorsepower(request.horsepower());
        car.setDrivetrain(request.drivetrain());
        car.setTorqueNm(request.torqueNm());
        car.setRpmMax(request.rpmMax());
        car.setEngineName(request.engineName());
        car.setEngineLayout(request.engineLayout());
        car.setWeightKg(request.weightKg());
        car.setHeightMm(request.heightMm());
        car.setLengthMm(request.lengthMm());
        car.setWidthMm(request.widthMm());
        car.setWikiUrl(request.wikiUrl());
        car.setCategory(request.category());
        return car;
    }
}
