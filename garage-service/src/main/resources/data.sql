-- =====================================================================
-- Garage Service seed data
-- Countries + Brands (mapped from the provided manufacturer logos).
-- Intentionally does NOT seed any cars: the garage starts empty and
-- cars are added by the logged-in user through the app.
-- This script is idempotent: it only inserts rows that do not exist yet,
-- so it is safe to run on every application startup (spring.sql.init.mode=always).
-- =====================================================================

-- ---------------------------------------------------------------------
-- COUNTRIES
-- ---------------------------------------------------------------------
INSERT INTO countries (name, iso_code) SELECT 'Austria', 'AUT' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'Austria');
INSERT INTO countries (name, iso_code) SELECT 'China', 'CHN' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'China');
INSERT INTO countries (name, iso_code) SELECT 'France', 'FRA' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'France');
INSERT INTO countries (name, iso_code) SELECT 'Germany', 'DEU' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'Germany');
INSERT INTO countries (name, iso_code) SELECT 'Italy', 'ITA' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'Italy');
INSERT INTO countries (name, iso_code) SELECT 'Japan', 'JPN' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'Japan');
INSERT INTO countries (name, iso_code) SELECT 'South Korea', 'KOR' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'South Korea');
INSERT INTO countries (name, iso_code) SELECT 'Sweden', 'SWE' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'Sweden');
INSERT INTO countries (name, iso_code) SELECT 'United Kingdom', 'GBR' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'United Kingdom');
INSERT INTO countries (name, iso_code) SELECT 'United States', 'USA' WHERE NOT EXISTS (SELECT 1 FROM countries WHERE name = 'United States');

-- ---------------------------------------------------------------------
-- BRANDS (each linked to its country)
-- ---------------------------------------------------------------------
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Red Bull Racing', 'red-bull-racing-logo.png', (SELECT id FROM countries WHERE name = 'Austria') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Red Bull Racing');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Williams', 'williams-f1-logo.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Williams');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'AC', 'AC-logo-1920x1080.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'AC');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'AMG', 'AMG-logo-black-1920x1080.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'AMG');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Abarth', 'Abarth-logo-1920x1080.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Abarth');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Acura', 'Acura-logo-1990-1024x768.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Acura');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Alfa Romeo', 'Alfa-romeo-logo.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Alfa Romeo');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Alpine', 'Alpine-emblem-1920x1080.png', (SELECT id FROM countries WHERE name = 'France') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Alpine');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Audi Sport', 'Audi-Sport-logo-2500x500.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Audi Sport');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'BMW M', 'BMW-M-logo-1920x1080.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'BMW M');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'BYD', 'BYD-logo-2007-2560x1440.png', (SELECT id FROM countries WHERE name = 'China') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'BYD');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Bentley', 'Bentley-Logo.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Bentley');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Bugatti', 'Bugatti-logo-1024x768.png', (SELECT id FROM countries WHERE name = 'France') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Bugatti');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Buick', 'Buick-logo-2002-2560x1440.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Buick');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Chevrolet', 'Chevrolet-logo-2013-2560x1440.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Chevrolet');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Citroen', 'Citroen-logo-2009-2048x2048.png', (SELECT id FROM countries WHERE name = 'France') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Citroen');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'DMC', 'DMC-logo.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'DMC');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'DS', 'DS-logo-2009-1920x1080.png', (SELECT id FROM countries WHERE name = 'France') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'DS');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Daihatsu', 'Daihatsu-logo-1997-1280x233.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Daihatsu');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Fiat', 'Fiat-logo-2006-1920x1080.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Fiat');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'General Motors', 'General-Motors-logo-2010-3300x3300.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'General Motors');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Isuzu', 'Isuzu-logo-1991-3840x2160.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Isuzu');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Iveco', 'Iveco-logo-silver-3840x2160.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Iveco');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Kia', 'Kia-logo.png', (SELECT id FROM countries WHERE name = 'South Korea') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Kia');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Koenigsegg', 'Koenigsegg-logo-1994-2048x2048.png', (SELECT id FROM countries WHERE name = 'Sweden') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Koenigsegg');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Land Rover', 'Land-Rover-logo-2011-1920x1080.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Land Rover');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Lancia', 'Lancia-logo.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Lancia');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Lexus', 'Lexus-logo-1988-1920x1080.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Lexus');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Lotus', 'Lotus-logo-3000x3000.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Lotus');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'MG', 'MG-logo-red-2010-1920x1080.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'MG');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'McLaren', 'McLaren-logo-2002-2560x1440.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'McLaren');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Mercedes-Benz', 'Mercedes-Benz-logo-2011-1920x1080.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Mercedes-Benz');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Mini', 'Mini-logo-2001-1920x1080.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Mini');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Mitsubishi', 'Mitsubishi-logo-2000x2500.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Mitsubishi');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Mustang', 'Mustang-logo-2009-1920x1080.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Mustang');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Nismo', 'Nismo-logo-2000x450.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Nismo');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Opel', 'Opel-logo-2002-2048x2048.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Opel');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Pagani', 'Pagani-logo-1992-1440x900.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Pagani');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Panoz', 'Panoz-logo-1920x1080.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Panoz');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Peugeot', 'Peugeot-logo-2010-1920x1080.png', (SELECT id FROM countries WHERE name = 'France') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Peugeot');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Pontiac', 'Pontiac-logo-2560x1440.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Pontiac');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Ram', 'Ram-Logo-650x366.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Ram');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Renault', 'Renault-Logo-650x366.png', (SELECT id FROM countries WHERE name = 'France') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Renault');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Rolls-Royce', 'Rolls-Royce-logo-2048x2048.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Rolls-Royce');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Ruf', 'Ruf-logo-1366x768.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Ruf');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Suzuki', 'Suzuki-logo-6500x1400.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Suzuki');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Volkswagen', 'Volkswagen-logo-2000-1920x1080.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Volkswagen');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Volvo', 'Volvo-logo-2012-2048x2048.png', (SELECT id FROM countries WHERE name = 'Sweden') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Volvo');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Aston Martin', 'aston-martin-logo.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Aston Martin');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Audi', 'audi-logo-2009-640.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Audi');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'BMW', 'bmw-logo-1997-640.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'BMW');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Cadillac', 'cadillac-logo-2009-full-640.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Cadillac');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Chevrolet Corvette', 'chevrolet-corvette-logo-2014-640.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Chevrolet Corvette');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Chrysler', 'chrysler-logo-1998-640.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Chrysler');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Dome', 'dome-co-ltd-logo.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Dome');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Ferrari', 'ferrari-logo-1981-640.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Ferrari');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Ford', 'ford-logo-1976-640.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Ford');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Honda', 'honda-logo-2000-full-640.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Honda');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Hyundai', 'hyundai-logo-2011-640.png', (SELECT id FROM countries WHERE name = 'South Korea') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Hyundai');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Jaguar', 'jaguar-logo-2012-640.png', (SELECT id FROM countries WHERE name = 'United Kingdom') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Jaguar');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Jeep', 'jeep-logo-1993-640.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Jeep');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Lamborghini', 'lamborghini-logo-1972-640.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Lamborghini');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Maserati', 'maserati-logo-2006-2.png', (SELECT id FROM countries WHERE name = 'Italy') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Maserati');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Mazda', 'mazda-logo-1997-640.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Mazda');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Mercury', 'mercury-logo.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Mercury');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Nissan', 'nissan-logo-2013-700x700-show.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Nissan');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Porsche', 'porsche-logo-1994-full-640.png', (SELECT id FROM countries WHERE name = 'Germany') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Porsche');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Subaru', 'subaru-logo-2019-640.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Subaru');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Tesla', 'tesla-logo-2007-full-640.png', (SELECT id FROM countries WHERE name = 'United States') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Tesla');
INSERT INTO brands (name, logo_file_name, country_id) SELECT 'Toyota', 'toyota-logo-2005-640.png', (SELECT id FROM countries WHERE name = 'Japan') WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Toyota');
