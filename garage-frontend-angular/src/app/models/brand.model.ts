import { Country } from './country.model';

export interface Brand {
  id: number;
  name: string;
  logoFileName: string | null;
  logoUrl: string | null;
  country: Country;
}

export interface BrandRequest {
  name: string;
  logoFileName?: string | null;
  countryId: number;
}
