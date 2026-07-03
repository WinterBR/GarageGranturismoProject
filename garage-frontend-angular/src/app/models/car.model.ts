import { Brand } from './brand.model';
import { Country } from './country.model';
import { Drivetrain } from './drivetrain.model';
import { EngineLayout } from './engine-layout.model';

export interface CarDimensions {
  heightMm: number;
  lengthMm: number;
  widthMm: number;
}

/** Mirrors CarDto.Response from the backend. */
export interface Car {
  id: number;
  name: string;
  brand: Brand;
  country: Country;
  colorHex: string;
  creationYear: number;
  horsepower: number;
  drivetrain: Drivetrain;
  drivetrainDescription: string;
  torqueNm: number;
  rpmMax: number;
  engineName: string;
  engineLayout: EngineLayout;
  engineLayoutDescription: string;
  weightKg: number;
  dimensions: CarDimensions;
  wikiUrl?: string | null;
  category?: string | null;
}

/** Mirrors CarDto.Request from the backend (country is server-derived). */
export interface CarRequest {
  name: string;
  brandId: number;
  colorHex: string;
  creationYear: number;
  horsepower: number;
  drivetrain: Drivetrain;
  torqueNm: number;
  rpmMax: number;
  engineName: string;
  engineLayout: EngineLayout;
  weightKg: number;
  heightMm: number;
  lengthMm: number;
  widthMm: number;
  wikiUrl?: string | null;
  category?: string | null;
}

/** Optional filters supported by GET /api/v1/cars. */
export interface CarSearchFilters {
  brandId?: number | null;
  countryId?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  minHp?: number | null;
  maxHp?: number | null;
  drivetrain?: Drivetrain | null;
}
