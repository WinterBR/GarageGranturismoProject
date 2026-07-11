import { Injectable, Signal, computed, signal } from '@angular/core';
import { Brand } from '../models/brand.model';
import { Car, CarRequest } from '../models/car.model';
import { Country } from '../models/country.model';
import { Drivetrain } from '../models/drivetrain.model';
import { GarageApiService } from './garage-api.service';

export type ColumnBKey = 'engine' | 'drivetrain';
export type ColumnCKey = 'hp' | 'torque' | 'rpm' | 'category';
export type ColumnDKey = 'weight' | 'height' | 'length' | 'width';

export type SortKey =
  | 'name'
  | 'creationYear'
  | 'colB'
  | 'colC'
  | 'colD';

export interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}

/**
 * Central, signal-based state for the garage screen: holds the full
 * car list (as loaded from the backend), the active filters/search/sort,
 * the chosen variable columns (B/C/D) and the user's manual ordering.
 *
 * Components read derived state via the exposed computed signals and
 * mutate state via the methods below — no direct mutation from outside.
 */
@Injectable({ providedIn: 'root' })
export class GarageStateService {
  private readonly _cars = signal<Car[]>([]);
  private readonly _countries = signal<Country[]>([]);
  private readonly _brands = signal<Brand[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _filterCountryId = signal<number | null>(null);
  private readonly _filterBrandId = signal<number | null>(null);
  private readonly _filterDrivetrain = signal<Drivetrain | null>(null);
  private readonly _searchTerm = signal<string>('');

  private readonly _columnB = signal<ColumnBKey>('engine');
  private readonly _columnC = signal<ColumnCKey>('hp');
  private readonly _columnD = signal<ColumnDKey>('weight');

  private readonly _sort = signal<SortState>({ key: 'colC', direction: 'desc' });

  /** Manual order, as an array of car ids. Empty until the user reorders. */
  private readonly _manualOrder = signal<number[]>([]);

  private readonly _selectedCarId = signal<number | null>(null);

  readonly cars = this._cars.asReadonly();
  readonly countries = this._countries.asReadonly();
  readonly brands = this._brands.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filterCountryId = this._filterCountryId.asReadonly();
  readonly filterBrandId = this._filterBrandId.asReadonly();
  readonly filterDrivetrain = this._filterDrivetrain.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  readonly columnB = this._columnB.asReadonly();
  readonly columnC = this._columnC.asReadonly();
  readonly columnD = this._columnD.asReadonly();

  readonly sort = this._sort.asReadonly();
  readonly selectedCarId = this._selectedCarId.asReadonly();

  /** Brands available for the dropdown, narrowed by the selected country (if any). */
  readonly brandsForFilter = computed(() => {
    const countryId = this._filterCountryId();
    const all = this._brands();
    if (countryId == null) return all;
    return all.filter((b) => b.country.id === countryId);
  });

  /** Cars after applying country/brand/drivetrain/search filters. */
  readonly filteredCars = computed(() => {
    const countryId = this._filterCountryId();
    const brandId = this._filterBrandId();
    const drivetrain = this._filterDrivetrain();
    const term = this._searchTerm().trim().toLowerCase();

    return this._cars().filter((car) => {
      if (countryId != null && car.country.id !== countryId) return false;
      if (brandId != null && car.brand.id !== brandId) return false;
      if (drivetrain != null && car.drivetrain !== drivetrain) return false;
      if (term && !car.name.toLowerCase().includes(term)) return false;
      return true;
    });
  });

  /** Filtered cars, sorted by the active sort key/direction, or by manual order. */
  readonly visibleCars = computed(() => {
    const list = [...this.filteredCars()];
    const order = this._manualOrder();

    if (order.length > 0) {
      const indexOf = new Map<number, number>(order.map((id, i) => [id, i]));
      list.sort((a, b) => {
        const ia = indexOf.has(a.id) ? indexOf.get(a.id)! : Number.MAX_SAFE_INTEGER;
        const ib = indexOf.has(b.id) ? indexOf.get(b.id)! : Number.MAX_SAFE_INTEGER;
        return ia - ib;
      });
      return list;
    }

    const { key, direction } = this._sort();
    const dir = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      const va = this.sortValue(a, key);
      const vb = this.sortValue(b, key);
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb) * dir;
      }
      return ((va as number) - (vb as number)) * dir;
    });
    return list;
  });

  constructor(private api: GarageApiService) {}

  private sortValue(car: Car, key: SortKey): string | number {
    switch (key) {
      case 'name':
        return car.name;
      case 'creationYear':
        return car.creationYear;
      case 'colB':
        return this._columnB() === 'engine' ? car.engineName : car.drivetrain;
      case 'colC': {
        const c = this._columnC();
        return c === 'hp' ? car.horsepower : c === 'torque' ? car.torqueNm : c === 'rpm' ? car.rpmMax : (car.category ?? '');
      }
      case 'colD': {
        const d = this._columnD();
        return d === 'weight'
          ? car.weightKg
          : d === 'height'
          ? car.dimensions.heightMm
          : d === 'length'
          ? car.dimensions.lengthMm
          : car.dimensions.widthMm;
      }
    }
  }

  // ---------------------------------------------------------------- Loading

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getCountries().subscribe({
      next: (countries) => this._countries.set(countries),
      error: () => this._error.set('Could not load countries from the backend.'),
    });

    this.api.getBrands().subscribe({
      next: (brands) => this._brands.set(brands),
      error: () => this._error.set('Could not load brands from the backend.'),
    });

    this.api.getCars().subscribe({
      next: (cars) => {
        this._cars.set(cars);
        this._loading.set(false);
      },
      error: () => {
        this._error.set(
          'Could not reach the garage-service backend. Make sure it is running ' +
            '(see README) and reachable at the configured API base URL.'
        );
        this._loading.set(false);
      },
    });
  }

  refreshCars(): void {
    this.api.getCars().subscribe({
      next: (cars) => {
        this._cars.set(cars);
        // Drop manual-order entries for ids that no longer exist.
        const validIds = new Set(cars.map((c) => c.id));
        this._manualOrder.set(this._manualOrder().filter((id) => validIds.has(id)));
      },
      error: () => this._error.set('Could not refresh the car list.'),
    });
  }

  // ---------------------------------------------------------------- Filters

  setFilterCountry(countryId: number | null): void {
    this._filterCountryId.set(countryId);
    // Reset brand filter if it no longer matches the chosen country.
    const brandId = this._filterBrandId();
    if (brandId != null) {
      const brand = this._brands().find((b) => b.id === brandId);
      if (brand && countryId != null && brand.country.id !== countryId) {
        this._filterBrandId.set(null);
      }
    }
  }

  setFilterBrand(brandId: number | null): void {
    this._filterBrandId.set(brandId);
  }

  setFilterDrivetrain(drivetrain: Drivetrain | null): void {
    this._filterDrivetrain.set(drivetrain);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  // ---------------------------------------------------------------- Columns

  setColumnB(value: ColumnBKey): void {
    this._columnB.set(value);
  }

  setColumnC(value: ColumnCKey): void {
    this._columnC.set(value);
  }

  setColumnD(value: ColumnDKey): void {
    this._columnD.set(value);
  }

  // ---------------------------------------------------------------- Sorting

  toggleSort(key: SortKey): void {
    const current = this._sort();
    if (current.key === key) {
      this._sort.set({ key, direction: current.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      this._sort.set({ key, direction: 'desc' });
    }
    // Any explicit sort click clears manual ordering, since the two are
    // mutually exclusive ways of ordering the list.
    this._manualOrder.set([]);
  }

  /**
   * Flips the current ordering without changing what it's ordered by.
   * Works whether the list is currently sorted by a column or manually
   * dragged into place — in the latter case it just reverses the
   * manual order array.
   */
  invertOrder(): void {
    const manual = this._manualOrder();
    if (manual.length > 0) {
      this._manualOrder.set([...manual].reverse());
      return;
    }
    const current = this._sort();
    this._sort.set({ key: current.key, direction: current.direction === 'asc' ? 'desc' : 'asc' });
  }

  // ---------------------------------------------------------------- Manual reorder

  reorder(draggedId: number, targetId: number): void {
    const current = this.visibleCars().map((c) => c.id);
    const fromIndex = current.indexOf(draggedId);
    const toIndex = current.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const reordered = [...current];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, draggedId);
    this._manualOrder.set(reordered);
  }

  // ---------------------------------------------------------------- Selection

  selectCar(id: number | null): void {
    this._selectedCarId.set(id);
  }

  /** The currently selected car, or null. Reactive: updates whenever the
   * selection or the car list changes. */
  readonly selectedCar: Signal<Car | null> = computed(() => {
    const id = this._selectedCarId();
    return id == null ? null : this._cars().find((c) => c.id === id) ?? null;
  });

  // ---------------------------------------------------------------- CRUD

  createCar(request: CarRequest, onSuccess: (car: Car) => void, onError: (msg: string) => void): void {
    this.api.createCar(request).subscribe({
      next: (car) => {
        this._cars.set([...this._cars(), car]);
        onSuccess(car);
      },
      error: (err) => onError(this.extractErrorMessage(err)),
    });
  }

  updateCar(
    id: number,
    request: CarRequest,
    onSuccess: (car: Car) => void,
    onError: (msg: string) => void
  ): void {
    this.api.updateCar(id, request).subscribe({
      next: (car) => {
        this._cars.set(this._cars().map((c) => (c.id === id ? car : c)));
        onSuccess(car);
      },
      error: (err) => onError(this.extractErrorMessage(err)),
    });
  }

  deleteCar(id: number, onSuccess: () => void, onError: (msg: string) => void): void {
    this.api.deleteCar(id).subscribe({
      next: () => {
        this._cars.set(this._cars().filter((c) => c.id !== id));
        this._manualOrder.set(this._manualOrder().filter((cid) => cid !== id));
        if (this._selectedCarId() === id) this._selectedCarId.set(null);
        onSuccess();
      },
      error: (err) => onError(this.extractErrorMessage(err)),
    });
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.details?.length) return err.error.details.join(', ');
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    return 'Something went wrong talking to the backend.';
  }
}
