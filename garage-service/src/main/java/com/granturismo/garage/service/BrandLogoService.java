package com.granturismo.garage.service;

import com.granturismo.garage.domain.Brand;
import com.granturismo.garage.exception.ResourceNotFoundException;
import com.granturismo.garage.repository.BrandRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

/**
 * Loads brand logo PNG files bundled under
 * src/main/resources/images/brands/ on the classpath.
 */
@Service
public class BrandLogoService {

    private static final String LOGO_BASE_PATH = "images/brands/";

    private final BrandRepository brandRepository;

    public BrandLogoService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public Resource loadLogo(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> ResourceNotFoundException.of("Brand", brandId));

        if (brand.getLogoFileName() == null || brand.getLogoFileName().isBlank()) {
            throw new ResourceNotFoundException("Brand " + brandId + " has no logo file configured");
        }

        Resource resource = new ClassPathResource(LOGO_BASE_PATH + brand.getLogoFileName());
        if (!resource.exists()) {
            throw new ResourceNotFoundException("Logo file not found on classpath: " + brand.getLogoFileName());
        }
        return resource;
    }
}
