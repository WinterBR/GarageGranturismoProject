export interface Country {
  id: number;
  name: string;
  isoCode: string | null;
}

export interface CountryRequest {
  name: string;
  isoCode?: string | null;
}
