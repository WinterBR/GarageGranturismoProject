package com.granturismo.garage.controller;

import com.granturismo.garage.dto.CountryDto;
import com.granturismo.garage.service.CountryService;
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
@RequestMapping("/api/v1/countries")
@Tag(name = "Countries", description = "Countries of origin for car brands")
public class CountryController {

    private final CountryService countryService;

    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    @GetMapping
    @Operation(summary = "List all countries")
    public List<CountryDto.Response> findAll() {
        return countryService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a country by id")
    public CountryDto.Response findById(@Parameter(description = "Country id") @PathVariable Long id) {
        return countryService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create a new country")
    public ResponseEntity<CountryDto.Response> create(@Valid @RequestBody CountryDto.Request request) {
        CountryDto.Response created = countryService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/countries/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing country")
    public CountryDto.Response update(@PathVariable Long id, @Valid @RequestBody CountryDto.Request request) {
        return countryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a country")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        countryService.delete(id);
    }
}
