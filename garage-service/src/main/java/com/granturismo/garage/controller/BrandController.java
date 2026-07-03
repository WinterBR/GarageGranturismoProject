package com.granturismo.garage.controller;

import com.granturismo.garage.dto.BrandDto;
import com.granturismo.garage.service.BrandLogoService;
import com.granturismo.garage.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@Tag(name = "Brands", description = "Car manufacturers / brands")
public class BrandController {

    private final BrandService brandService;
    private final BrandLogoService brandLogoService;

    public BrandController(BrandService brandService, BrandLogoService brandLogoService) {
        this.brandService = brandService;
        this.brandLogoService = brandLogoService;
    }

    @GetMapping
    @Operation(summary = "List all brands")
    public List<BrandDto.Response> findAll() {
        return brandService.findAll();
    }

    @GetMapping("/by-country/{countryId}")
    @Operation(summary = "List brands by country")
    public List<BrandDto.Response> findByCountry(@PathVariable Long countryId) {
        return brandService.findByCountry(countryId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a brand by id")
    public BrandDto.Response findById(@Parameter(description = "Brand id") @PathVariable Long id) {
        return brandService.findById(id);
    }

    @GetMapping("/{id}/logo")
    @Operation(summary = "Get the brand logo image (PNG)")
    public ResponseEntity<Resource> getLogo(@PathVariable Long id) {
        Resource resource = brandLogoService.loadLogo(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(resource);
    }

    @PostMapping
    @Operation(summary = "Create a new brand")
    public ResponseEntity<BrandDto.Response> create(@Valid @RequestBody BrandDto.Request request) {
        BrandDto.Response created = brandService.create(request);
        return ResponseEntity.created(URI.create("/api/v1/brands/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing brand")
    public BrandDto.Response update(@PathVariable Long id, @Valid @RequestBody BrandDto.Request request) {
        return brandService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a brand")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        brandService.delete(id);
    }
}
