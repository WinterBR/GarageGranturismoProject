/**
 * Static lookup tables for country flags and brand logos.
 * Flags are bundled as local SVG assets (src/assets/flags).
 * Brand logos are served by the backend (GET /api/v1/brands/{id}/logo),
 * but we also keep the local file name mapping in case a fully static
 * preview (no backend) is useful during frontend-only development.
 */

export const COUNTRY_FLAG_FILE: Record<string, string> = {
  "Austria": "austria",
  "China": "china",
  "France": "france",
  "Germany": "germany",
  "Italy": "italy",
  "Japan": "japan",
  "South Korea": "south_korea",
  "Sweden": "sweden",
  "United Kingdom": "united_kingdom",
  "United States": "united_states"
};

export const BRAND_LOGO_FILE: Record<string, string> = {
  "Red Bull Racing": "red-bull-racing-logo.png",
  "Williams": "williams-f1-logo.png",
  "AC": "AC-logo-1920x1080.png",
  "AMG": "AMG-logo-black-1920x1080.png",
  "Abarth": "Abarth-logo-1920x1080.png",
  "Acura": "Acura-logo-1990-1024x768.png",
  "Alfa Romeo": "Alfa-romeo-logo.png",
  "Alpine": "Alpine-emblem-1920x1080.png",
  "Audi Sport": "Audi-Sport-logo-2500x500.png",
  "BMW M": "BMW-M-logo-1920x1080.png",
  "BYD": "BYD-logo-2007-2560x1440.png",
  "Bentley": "Bentley-Logo.png",
  "Bugatti": "Bugatti-logo-1024x768.png",
  "Buick": "Buick-logo-2002-2560x1440.png",
  "Chevrolet": "Chevrolet-logo-2013-2560x1440.png",
  "Citroen": "Citroen-logo-2009-2048x2048.png",
  "DMC": "DMC-logo.png",
  "DS": "DS-logo-2009-1920x1080.png",
  "Daihatsu": "Daihatsu-logo-1997-1280x233.png",
  "Fiat": "Fiat-logo-2006-1920x1080.png",
  "General Motors": "General-Motors-logo-2010-3300x3300.png",
  "Isuzu": "Isuzu-logo-1991-3840x2160.png",
  "Iveco": "Iveco-logo-silver-3840x2160.png",
  "Kia": "Kia-logo.png",
  "Koenigsegg": "Koenigsegg-logo-1994-2048x2048.png",
  "Land Rover": "Land-Rover-logo-2011-1920x1080.png",
  "Lancia": "Lancia-logo.png",
  "Lexus": "Lexus-logo-1988-1920x1080.png",
  "Lotus": "Lotus-logo-3000x3000.png",
  "MG": "MG-logo-red-2010-1920x1080.png",
  "McLaren": "McLaren-logo-2002-2560x1440.png",
  "Mercedes-Benz": "Mercedes-Benz-logo-2011-1920x1080.png",
  "Mini": "Mini-logo-2001-1920x1080.png",
  "Mitsubishi": "Mitsubishi-logo-2000x2500.png",
  "Mustang": "Mustang-logo-2009-1920x1080.png",
  "Nismo": "Nismo-logo-2000x450.png",
  "Opel": "Opel-logo-2002-2048x2048.png",
  "Pagani": "Pagani-logo-1992-1440x900.png",
  "Panoz": "Panoz-logo-1920x1080.png",
  "Peugeot": "Peugeot-logo-2010-1920x1080.png",
  "Pontiac": "Pontiac-logo-2560x1440.png",
  "Ram": "Ram-Logo-650x366.png",
  "Renault": "Renault-Logo-650x366.png",
  "Rolls-Royce": "Rolls-Royce-logo-2048x2048.png",
  "Ruf": "Ruf-logo-1366x768.png",
  "Suzuki": "Suzuki-logo-6500x1400.png",
  "Volkswagen": "Volkswagen-logo-2000-1920x1080.png",
  "Volvo": "Volvo-logo-2012-2048x2048.png",
  "Aston Martin": "aston-martin-logo.png",
  "Audi": "audi-logo-2009-640.png",
  "BMW": "bmw-logo-1997-640.png",
  "Cadillac": "cadillac-logo-2009-full-640.png",
  "Chevrolet Corvette": "chevrolet-corvette-logo-2014-640.png",
  "Chrysler": "chrysler-logo-1998-640.png",
  "Dome": "dome-co-ltd-logo.png",
  "Ferrari": "ferrari-logo-1981-640.png",
  "Ford": "ford-logo-1976-640.png",
  "Honda": "honda-logo-2000-full-640.png",
  "Hyundai": "hyundai-logo-2011-640.png",
  "Jaguar": "jaguar-logo-2012-640.png",
  "Jeep": "jeep-logo-1993-640.png",
  "Lamborghini": "lamborghini-logo-1972-640.png",
  "Maserati": "maserati-logo-2006-2.png",
  "Mazda": "mazda-logo-1997-640.png",
  "Mercury": "mercury-logo.png",
  "Nissan": "nissan-logo-2013-700x700-show.png",
  "Porsche": "porsche-logo-1994-full-640.png",
  "Subaru": "subaru-logo-2019-640.png",
  "Tesla": "tesla-logo-2007-full-640.png",
  "Toyota": "toyota-logo-2005-640.png"
};

export function flagAssetPath(countryName: string | null | undefined): string {
  if (!countryName) return '';
  const key = COUNTRY_FLAG_FILE[countryName];
  return key ? `assets/flags/${key}.svg` : '';
}

export function logoAssetPath(brandName: string | null | undefined): string {
  if (!brandName) return '';
  const file = BRAND_LOGO_FILE[brandName];
  return file ? `assets/logos/${file}` : '';
}