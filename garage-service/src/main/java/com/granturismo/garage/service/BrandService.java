package com.granturismo.garage.service;

import com.granturismo.garage.domain.Brand;
import com.granturismo.garage.domain.Country;
import com.granturismo.garage.dto.BrandDto;
import com.granturismo.garage.exception.DuplicateResourceException;
import com.granturismo.garage.exception.ResourceNotFoundException;
import com.granturismo.garage.mapper.BrandMapper;
import com.granturismo.garage.repository.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BrandService {

    private final BrandRepository brandRepository;
    private final CountryService countryService;
    private final BrandMapper brandMapper;

    public BrandService(BrandRepository brandRepository, CountryService countryService, BrandMapper brandMapper) {
        this.brandRepository = brandRepository;
        this.countryService = countryService;
        this.brandMapper = brandMapper;
    }

    @Transactional(readOnly = true)
    public List<BrandDto.Response> findAll() {
        return brandRepository.findAll().stream()
                .map(brandMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BrandDto.Response> findByCountry(Long countryId) {
        return brandRepository.findByCountryIdOrderByNameAsc(countryId).stream()
                .map(brandMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BrandDto.Response findById(Long id) {
        return brandMapper.toResponse(getOrThrow(id));
    }

    public BrandDto.Response create(BrandDto.Request request) {
        if (brandRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Brand already exists with name: " + request.name());
        }
        Country country = countryService.getOrThrow(request.countryId());

        Brand brand = Brand.builder()
                .name(request.name())
                .logoFileName(request.logoFileName())
                .country(country)
                .build();
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    public BrandDto.Response update(Long id, BrandDto.Request request) {
        Brand brand = getOrThrow(id);
        Country country = countryService.getOrThrow(request.countryId());

        brand.setName(request.name());
        brand.setLogoFileName(request.logoFileName());
        brand.setCountry(country);
        return brandMapper.toResponse(brandRepository.save(brand));
    }

    public void delete(Long id) {
        Brand brand = getOrThrow(id);
        brandRepository.delete(brand);
    }

    Brand getOrThrow(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Brand", id));
    }
}
