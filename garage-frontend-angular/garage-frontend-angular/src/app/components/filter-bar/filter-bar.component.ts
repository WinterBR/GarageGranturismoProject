import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drivetrain, DRIVETRAIN_OPTIONS } from '../../models/drivetrain.model';
import { GarageStateService } from '../../services/garage-state.service';
import { AudioService } from '../../services/audio.service';

/** Which filter's popover (if any) is currently open. */
type FilterPicker = 'country' | 'manufacturer' | 'drivetrain';

/**
 * GT4-style "Sort by" filter bar: Country / Manufacturer / Drivetrain
 * dropdowns (grouped inside one shared panel) plus a separate Search
 * field pushed to the right, and the "New car" action.
 *
 * The Country/Manufacturer/Drivetrain triggers reuse the same visual
 * style as the table's Engine/Power/Weight column pickers
 * (.gt-col-trigger) instead of native <select> elements, since browsers
 * render their own chrome over <select> that can't be restyled to match.
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="gt-filterbar">
      <div class="gt-sortby">
        <span class="gt-sortby__label">Sort by</span>
      </div>

      <div class="gt-filter-panel">
        <div class="gt-filter-group gt-filter-group--country">
          <label class="gt-filter-label">Country</label>
          <div class="gt-col-trigger-wrap">
            <button
              type="button"
              class="gt-col-trigger"
              [class.is-open]="openPicker() === 'country'"
              (click)="togglePicker('country', $event)"
            >
              <span class="gt-col-trigger__value">{{ countryLabel() }}</span>
              <span class="gt-col-trigger__arrow"></span>
            </button>
            @if (openPicker() === 'country') {
              <div class="gt-col-menu" (click)="$event.stopPropagation()">
                <button type="button" class="gt-col-menu__item" [class.is-active]="state.filterCountryId() === null" (click)="pickCountry(null)">All</button>
                @for (country of state.countries(); track country.id) {
                  <button type="button" class="gt-col-menu__item" [class.is-active]="state.filterCountryId() === country.id" (click)="pickCountry(country.id)">{{ country.name }}</button>
                }
              </div>
            }
          </div>
        </div>

        <div class="gt-filter-group gt-filter-group--manufacturer">
          <label class="gt-filter-label">Manufacturer</label>
          <div class="gt-col-trigger-wrap">
            <button
              type="button"
              class="gt-col-trigger"
              [class.is-open]="openPicker() === 'manufacturer'"
              (click)="togglePicker('manufacturer', $event)"
            >
              <span class="gt-col-trigger__value">{{ brandLabel() }}</span>
              <span class="gt-col-trigger__arrow"></span>
            </button>
            @if (openPicker() === 'manufacturer') {
              <div class="gt-col-menu" (click)="$event.stopPropagation()">
                <button type="button" class="gt-col-menu__item" [class.is-active]="state.filterBrandId() === null" (click)="pickBrand(null)">All</button>
                @for (brand of state.brandsForFilter(); track brand.id) {
                  <button type="button" class="gt-col-menu__item" [class.is-active]="state.filterBrandId() === brand.id" (click)="pickBrand(brand.id)">{{ brand.name }}</button>
                }
              </div>
            }
          </div>
        </div>

        <div class="gt-filter-group gt-filter-group--drivetrain">
          <label class="gt-filter-label">Drivetrain</label>
          <div class="gt-col-trigger-wrap">
            <button
              type="button"
              class="gt-col-trigger"
              [class.is-open]="openPicker() === 'drivetrain'"
              (click)="togglePicker('drivetrain', $event)"
            >
              <span class="gt-col-trigger__value">{{ drivetrainLabel() }}</span>
              <span class="gt-col-trigger__arrow"></span>
            </button>
            @if (openPicker() === 'drivetrain') {
              <div class="gt-col-menu" (click)="$event.stopPropagation()">
                <button type="button" class="gt-col-menu__item" [class.is-active]="state.filterDrivetrain() === null" (click)="pickDrivetrain(null)">All</button>
                @for (opt of drivetrainOptions; track opt.value) {
                  <button type="button" class="gt-col-menu__item" [class.is-active]="state.filterDrivetrain() === opt.value" (click)="pickDrivetrain(opt.value)">{{ opt.label }}</button>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="gt-filter-panel gt-filter-panel--search">
        <div class="gt-filter-group gt-filter-group--search">
          <label class="gt-filter-label">Search</label>
          <input
            class="gt-search-input"
            type="text"
            placeholder="Car name..."
            [ngModel]="state.searchTerm()"
            (ngModelChange)="state.setSearchTerm($event)"
          />
        </div>
      </div>

      <button type="button" class="gt-btn gt-btn--new" (click)="onNewCarClick()">+ New car</button>
    </section>
  `,
})
export class FilterBarComponent {
  readonly drivetrainOptions = DRIVETRAIN_OPTIONS;

  readonly openPicker = signal<FilterPicker | null>(null);

  @Output() newCar = new EventEmitter<void>();

  constructor(public state: GarageStateService, private audio: AudioService) {}

  countryLabel(): string {
    const id = this.state.filterCountryId();
    if (id === null) return 'All';
    return this.state.countries().find((c) => c.id === id)?.name ?? 'All';
  }

  brandLabel(): string {
    const id = this.state.filterBrandId();
    if (id === null) return 'All';
    return this.state.brandsForFilter().find((b) => b.id === id)?.name ?? 'All';
  }

  drivetrainLabel(): string {
    const value = this.state.filterDrivetrain();
    if (value === null) return 'All';
    return this.drivetrainOptions.find((o) => o.value === value)?.label ?? 'All';
  }

  /** Closes any open filter picker when the user clicks anywhere outside it. */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.openPicker.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openPicker.set(null);
  }

  togglePicker(picker: FilterPicker, event: Event): void {
    event.stopPropagation();
    this.audio.playSfx('select');
    this.openPicker.set(this.openPicker() === picker ? null : picker);
  }

  pickCountry(id: number | null): void {
    this.audio.playSfx('select');
    this.state.setFilterCountry(id);
    this.openPicker.set(null);
  }

  pickBrand(id: number | null): void {
    this.audio.playSfx('select');
    this.state.setFilterBrand(id);
    this.openPicker.set(null);
  }

  pickDrivetrain(value: Drivetrain | null): void {
    this.audio.playSfx('select');
    this.state.setFilterDrivetrain(value);
    this.openPicker.set(null);
  }

  onNewCarClick(): void {
    this.audio.playSfx('select');
    this.newCar.emit();
  }
}
