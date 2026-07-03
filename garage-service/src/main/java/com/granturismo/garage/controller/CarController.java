package com.granturismo.garage.controller;

import com.granturismo.garage.domain.Drivetrain;
import com.granturismo.garage.dto.CarDto;
import com.granturismo.garage.service.CarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cars")
@Tag(name = "Cars", description = "Garage cars — Gran Turismo 4 style technical specs")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    @Operation(summary = "List all cars, or filter using optional query parameters",
            description = "All filters are optional and can be combined. Omit them to retrieve the full garage list.")
    public List<CarDto.Response> search(
            @Parameter(description = "Filter by brand id")     @RequestParam(required = false) Long brandId,
            @Parameter(description = "Filter by country id")   @RequestParam(required = false) Long countryId,
            @Parameter(description = "Minimum creation year")  @RequestParam(required = false) Integer minYear,
            @Parameter(description = "Maximum creation year")  @RequestParam(required = false) Integer maxYear,
            @Parameter(description = "Minimum horsepower")     @RequestParam(required = false) Integer minHp,
            @Parameter(description = "Maximum horsepower")     @RequestParam(required = false) Integer maxHp,
            @Parameter(description = "Filter by drivetrain, e.g. FF, FR, MR, FOUR_WD (4WD), AWD")
            @RequestParam(required = false) Drivetrain drivetrain
    ) {
        return carService.search(brandId, countryId, minYear, maxYear, minHp, maxHp, drivetrain);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a car by id")
    public CarDto.Response findById(@Parameter(description = "Car id") @PathVariable Long id) {
        return carService.findById(id);
    }

    @GetMapping("/by-brand/{brandId}")
    @Operation(summary = "List cars by brand")
    public List<CarDto.Response> findByBrand(@PathVariable Long brandId) {
        return carService.findByBrand(brandId);
    }

    @GetMapping("/by-country/{countryId}")
    @Operation(summary = "List cars by country")
    public List<CarDto.Response> findByCountry(@PathVariable Long countryId) {
        return carService.findByCountry(countryId);
    }

    @PostMapping
    @Operation(summary = "Add a new car to the garage")
    public ResponseEntity<CarDto.Response> create(@Valid @RequestBody CarDto.Request request) {
        CarDto.Response created = carService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/cars/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing car")
    public CarDto.Response update(@PathVariable Long id, @Valid @RequestBody CarDto.Request request) {
        return carService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a car from the garage")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        carService.delete(id);
    }
}
