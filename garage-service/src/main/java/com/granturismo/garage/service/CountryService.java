package com.granturismo.garage.service;

import com.granturismo.garage.domain.Country;
import com.granturismo.garage.dto.CountryDto;
import com.granturismo.garage.exception.DuplicateResourceException;
import com.granturismo.garage.exception.ResourceNotFoundException;
import com.granturismo.garage.mapper.CountryMapper;
import com.granturismo.garage.repository.CountryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CountryService {

    private final CountryRepository countryRepository;
    private final CountryMapper countryMapper;

    public CountryService(CountryRepository countryRepository, CountryMapper countryMapper) {
        this.countryRepository = countryRepository;
        this.countryMapper = countryMapper;
    }

    @Transactional(readOnly = true)
    public List<CountryDto.Response> findAll() {
        return countryRepository.findAll().stream()
                .map(countryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CountryDto.Response findById(Long id) {
        return countryMapper.toResponse(getOrThrow(id));
    }

    public CountryDto.Response create(CountryDto.Request request) {
        if (countryRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Country already exists with name: " + request.name());
        }
        Country country = Country.builder()
                .name(request.name())
                .isoCode(request.isoCode())
                .build();
        return countryMapper.toResponse(countryRepository.save(country));
    }

    public CountryDto.Response update(Long id, CountryDto.Request request) {
        Country country = getOrThrow(id);
        country.setName(request.name());
        country.setIsoCode(request.isoCode());
        return countryMapper.toResponse(countryRepository.save(country));
    }

    public void delete(Long id) {
        Country country = getOrThrow(id);
        countryRepository.delete(country);
    }

    Country getOrThrow(Long id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Country", id));
    }
}
