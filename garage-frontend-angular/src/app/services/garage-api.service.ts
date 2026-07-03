import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Brand, BrandRequest } from '../models/brand.model';
import { Car, CarRequest, CarSearchFilters } from '../models/car.model';
import { Country, CountryRequest } from '../models/country.model';
import { logoAssetPath } from '../models/asset-lookup.model';

/**
 * Single point of contact with the garage-service backend.
 * All endpoints mirror CountryController / BrandController / CarController.
 */
@Injectable({ providedIn: 'root' })
export class GarageApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ---------------------------------------------------------------- Countries

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/countries`);
  }

  createCountry(request: CountryRequest): Observable<Country> {
    return this.http.post<Country>(`${this.baseUrl}/countries`, request);
  }

  // ---------------------------------------------------------------- Brands

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/brands`);
  }

  getBrandsByCountry(countryId: number): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/brands/by-country/${countryId}`);
  }

  createBrand(request: BrandRequest): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}/brands`, request);
  }

  /** Local asset path for a brand's logo image, ready to use in [src]. */
  brandLogoUrl(brandName: string): string {
    return logoAssetPath(brandName);
  }

  // ---------------------------------------------------------------- Cars

  getCars(filters?: CarSearchFilters): Observable<Car[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.brandId != null) params = params.set('brandId', filters.brandId);
      if (filters.countryId != null) params = params.set('countryId', filters.countryId);
      if (filters.minYear != null) params = params.set('minYear', filters.minYear);
      if (filters.maxYear != null) params = params.set('maxYear', filters.maxYear);
      if (filters.minHp != null) params = params.set('minHp', filters.minHp);
      if (filters.maxHp != null) params = params.set('maxHp', filters.maxHp);
      if (filters.drivetrain) params = params.set('drivetrain', filters.drivetrain);
    }
    return this.http.get<Car[]>(`${this.baseUrl}/cars`, { params });
  }

  getCar(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/cars/${id}`);
  }

  createCar(request: CarRequest): Observable<Car> {
    return this.http.post<Car>(`${this.baseUrl}/cars`, request);
  }

  updateCar(id: number, request: CarRequest): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/cars/${id}`, request);
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cars/${id}`);
  }
}
