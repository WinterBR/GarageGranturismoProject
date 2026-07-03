import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { flagAssetPath } from '../../models/asset-lookup.model';
import { Car } from '../../models/car.model';
import { drivetrainLabel } from '../../models/drivetrain.model';
import { engineLayoutLabel } from '../../models/engine-layout.model';
import { GarageApiService } from '../../services/garage-api.service';
import { AudioService } from '../../services/audio.service';
import {
  ColumnBKey,
  ColumnCKey,
  ColumnDKey,
  GarageStateService,
} from '../../services/garage-state.service';
import { ColorRectComponent } from '../color-rect/color-rect.component';

/** Which variable column's picker popover (if any) is currently open. */
type PickerColumn = 'colB' | 'colC' | 'colD';

@Component({
  selector: 'app-car-table',
  standalone: true,
  imports: [CommonModule, ColorRectComponent],
  template: `
    <div class="gt-table-outer">
      <section class="gt-table-wrap" #tableWrap>
      <!-- Column divider overlay: vertical lines painted by JS across full header+body height -->
      <div class="gt-col-dividers" #dividerOverlay></div>
      <div class="gt-table-header" #tableHeader>
        <div class="gt-th gt-th--flag"></div>
        <div class="gt-th gt-th--logo"></div>
        <div class="gt-th gt-th--name">
          <span class="gt-th-row">
            <span>Car Name</span>
          </span>
        </div>
        <div class="gt-th gt-th--color"></div>
        <div class="gt-th gt-th--year">
          <span class="gt-th-row">
            <span>Year</span>
          </span>
        </div>

        <div class="gt-th gt-th--colB">
          <div class="gt-col-trigger-wrap">
            <button
              type="button"
              class="gt-col-trigger"
              [class.is-open]="openPicker() === 'colB'"
              (click)="togglePicker('colB', $event)"
            >
              <span class="gt-col-trigger__value">{{ columnBLabel() }}</span>
              <span class="gt-col-trigger__arrow"></span>
            </button>
          </div>
          @if (openPicker() === 'colB') {
            <div class="gt-col-menu" (click)="$event.stopPropagation()">
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnB() === 'engine'" (click)="pickColumnB('engine')">Engine</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnB() === 'drivetrain'" (click)="pickColumnB('drivetrain')">Drivetrain</button>
            </div>
          }
        </div>

        <div class="gt-th gt-th--invert">
          <button
            type="button"
            class="gt-invert-btn"
            [class.gt-invert-btn--asc]="state.sort().direction === 'asc'"
            title="Reverse order"
            (click)="invertOrder($event)"
          >
            <span class="gt-invert-btn__v">V</span>
          </button>
        </div>

        <div class="gt-th gt-th--colC">
          <div class="gt-col-trigger-wrap">
            <button
              type="button"
              class="gt-col-trigger"
              [class.is-open]="openPicker() === 'colC'"
              (click)="togglePicker('colC', $event)"
            >
              <span class="gt-col-trigger__value">{{ columnCLabel() }}</span>
              <span class="gt-col-trigger__arrow"></span>
            </button>
          </div>
          @if (openPicker() === 'colC') {
            <div class="gt-col-menu" (click)="$event.stopPropagation()">
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnC() === 'hp'" (click)="pickColumnC('hp')">Power (HP)</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnC() === 'torque'" (click)="pickColumnC('torque')">Torque</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnC() === 'rpm'" (click)="pickColumnC('rpm')">RPM</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnC() === 'category'" (click)="pickColumnC('category')">Category</button>
            </div>
          }
        </div>

        <div class="gt-th gt-th--colD">
          <div class="gt-col-trigger-wrap">
            <button
              type="button"
              class="gt-col-trigger"
              [class.is-open]="openPicker() === 'colD'"
              (click)="togglePicker('colD', $event)"
            >
              <span class="gt-col-trigger__value">{{ columnDLabel() }}</span>
              <span class="gt-col-trigger__arrow"></span>
            </button>
          </div>
          @if (openPicker() === 'colD') {
            <div class="gt-col-menu" (click)="$event.stopPropagation()">
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnD() === 'weight'" (click)="pickColumnD('weight')">Weight</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnD() === 'height'" (click)="pickColumnD('height')">Height</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnD() === 'length'" (click)="pickColumnD('length')">Length</button>
              <button type="button" class="gt-col-menu__item" [class.is-active]="state.columnD() === 'width'" (click)="pickColumnD('width')">Width</button>
            </div>
          }
        </div>

        <div class="gt-th gt-th--actions"></div>
      </div>

      <div class="gt-table-scroller">
        <div class="gt-table-body">
          @if (state.loading()) {
            <div class="gt-empty-row">Loading garage...</div>
          } @else if (state.visibleCars().length === 0) {
            <div class="gt-empty-row">No cars match these filters.</div>
          } @else {
            @for (car of pagedCars(); track car.id) {
              <div
                class="gt-row"
                [class.gt-row--selected]="car.id === state.selectedCarId()"
                [class.gt-row--dragging]="draggingId() === car.id"
                draggable="true"
                (click)="onRowClick(car.id)"
                (dragstart)="onDragStart(car.id)"
                (dragover)="onDragOver($event)"
                (drop)="onDrop(car.id)"
                (dragend)="onDragEnd()"
              >
                <div class="gt-cell gt-cell--flag">
                  <img [src]="flagFor(car.country.name)" [alt]="car.country.name" [title]="car.country.name" />
                </div>

                <div class="gt-cell gt-cell--logo">
                  <img [src]="logoUrl(car.brand.name)" [alt]="car.brand.name" [title]="car.brand.name" />
                </div>

                <div class="gt-cell gt-cell--name">{{ car.name }}</div>

                <div class="gt-cell gt-cell--color">
                  <app-color-rect [colorHex]="car.colorHex"></app-color-rect>
                </div>

                <div class="gt-cell gt-cell--year">{{ shortYear(car.creationYear) }}</div>

                <div class="gt-cell gt-cell--colB" [title]="columnBValue(car)">{{ columnBValue(car) }}</div>

                <div class="gt-cell gt-cell--invert"></div>

                <div class="gt-cell gt-cell--colC">
                  {{ columnCValue(car) }} <span class="unit">{{ columnCUnit() }}</span>
                </div>

                <div class="gt-cell gt-cell--colD">
                  {{ columnDValue(car) }} <span class="unit">{{ columnDUnit() }}</span>
                </div>

                <div class="gt-cell gt-cell--actions">
                  <button
                    type="button"
                    class="gt-icon-btn"
                    title="Edit car"
                    (click)="onEditClick(car); $event.stopPropagation()"
                  >
                    <img src="assets/icons/gt_edit.png" alt="Edit" />
                  </button>
                  <button
                    type="button"
                    class="gt-icon-btn gt-icon-btn--danger"
                    title="Remove car"
                    (click)="onRemoveClick(car); $event.stopPropagation()"
                  >
                    <img src="assets/icons/gt_delete.png" alt="Remove" />
                  </button>
                </div>
              </div>
            }
            @for (i of emptyRowIndexes(); track i) {
              <div class="gt-row gt-row--empty" aria-hidden="true">
                <div class="gt-cell gt-cell--flag"></div>
                <div class="gt-cell gt-cell--logo"></div>
                <div class="gt-cell gt-cell--name"></div>
                <div class="gt-cell gt-cell--color"></div>
                <div class="gt-cell gt-cell--year"></div>
                <div class="gt-cell gt-cell--colB"></div>
                <div class="gt-cell gt-cell--invert"></div>
                <div class="gt-cell gt-cell--colC"></div>
                <div class="gt-cell gt-cell--colD"></div>
                <div class="gt-cell gt-cell--actions"></div>
              </div>
            }
          }
        </div>
      </div>

      <div class="gt-table-footer" #tableFooter>
        <span>{{ rangeLabel() }} of {{ state.visibleCars().length }} cars</span>
        @if (pageCount() > 1) {
          <span class="gt-table-footer__page">Page {{ clampedPage() + 1 }} / {{ pageCount() }}</span>
        }
      </div>
      </section>

      @if (pageCount() > 1) {
        <button
          type="button"
          class="gt-page-arrow gt-page-arrow--prev"
          title="Previous cars"
          [disabled]="clampedPage() === 0"
          (click)="prevPage()"
        >
          <svg class="gt-page-arrow__shape" viewBox="0 0 40 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gtArrowFadePrev" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#000000" stop-opacity="0" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.92" />
              </linearGradient>
            </defs>
            <polygon points="40,4 40,60 4,32" fill="url(#gtArrowFadePrev)" />
          </svg>
        </button>
        <button
          type="button"
          class="gt-page-arrow gt-page-arrow--next"
          title="Next cars"
          [disabled]="clampedPage() >= pageCount() - 1"
          (click)="nextPage()"
        >
          <svg class="gt-page-arrow__shape" viewBox="0 0 40 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gtArrowFadeNext" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#000000" stop-opacity="0" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.92" />
              </linearGradient>
            </defs>
            <polygon points="0,4 0,60 36,32" fill="url(#gtArrowFadeNext)" />
          </svg>
        </button>
      }
    </div>
  `,
})
export class CarTableComponent implements AfterViewInit, OnDestroy {
  @Output() edit = new EventEmitter<Car>();
  @Output() remove = new EventEmitter<Car>();

  @ViewChild('tableWrap') tableWrapRef!: ElementRef<HTMLElement>;
  @ViewChild('tableHeader') tableHeaderRef!: ElementRef<HTMLElement>;
  @ViewChild('dividerOverlay') dividerOverlayRef!: ElementRef<HTMLElement>;
  @ViewChild('tableFooter') tableFooterRef!: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.updateDividers();

    // Re-run once the custom @font-face faces have actually loaded: swapping
    // from the fallback font to "Helvetica Pan-European LT Std" can shift
    // header label widths slightly, which moves where each column boundary
    // falls even though the wrapper's own outer size hasn't changed.
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => this.updateDividers());
    }

    // Observe the table wrapper (catches viewport/layout resizes) AND every
    // individual header cell (catches column-width changes caused purely by
    // internal content/font shifts, which never change the wrapper's own
    // outer width and so would otherwise never trigger a recalculation).
    this.resizeObserver = new ResizeObserver(() => this.updateDividers());
    this.resizeObserver.observe(this.tableWrapRef.nativeElement);
    const headerCells = this.tableHeaderRef?.nativeElement?.querySelectorAll<HTMLElement>('.gt-th');
    headerCells?.forEach((cell) => this.resizeObserver!.observe(cell));
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private updateDividers(): void {
    const header = this.tableHeaderRef?.nativeElement;
    const wrap = this.tableWrapRef?.nativeElement;
    const overlay = this.dividerOverlayRef?.nativeElement;
    const footer = this.tableFooterRef?.nativeElement;
    if (!header || !wrap || !overlay) return;

    const cells = Array.from(header.querySelectorAll<HTMLElement>('.gt-th'));
    const wrapRect = wrap.getBoundingClientRect();
    const footerHeight = footer ? footer.offsetHeight : 52;
    const overlayHeight = wrap.offsetHeight - footerHeight;

    // getBoundingClientRect() returns scaled viewport coords.
    // The overlay lives inside the wrap (pre-scale layout space).
    // Divide by the actual rendered scale to get layout pixels.
    const scaleX = wrapRect.width / wrap.offsetWidth;

    // Remove old dividers
    overlay.innerHTML = '';
    overlay.style.height = overlayHeight + 'px';

    const skipAfter = new Set([6, cells.length - 1]);

    // column-gap in layout px (same value as CSS column-gap on .gt-table-header/.gt-row)
    const columnGap = 0;

    for (let i = 0; i < cells.length; i++) {
      if (skipAfter.has(i)) continue;
      const cellRect = cells[i].getBoundingClientRect();
      // cellRect.right is the end of the cell; add half the gap to reach the centre of the gap
      const centerOfGap = (cellRect.right - wrapRect.left) / scaleX + columnGap / 2;

      const line = document.createElement('div');
      line.style.cssText = `
        position: absolute;
        top: 0;
        left: ${centerOfGap - 3.5}px;
        width: 7px;
        height: ${overlayHeight}px;
        background: rgba(0,0,0,0.35);
        pointer-events: none;
      `;
      overlay.appendChild(line);
    }
  }

  readonly draggingId = signal<number | null>(null);

  /** Which column's "what to show here" popover is open, if any. */
  readonly openPicker = signal<PickerColumn | null>(null);

  /** Fixed number of rows shown per page, matching the reference design
   * (the table shows exactly 10 rows; extra cars are reached via the
   * prev/next page arrows rather than scrolling or resizing). */
  readonly pageSize = signal(10);
  readonly page = signal(0);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.state.visibleCars().length / this.pageSize()))
  );

  /** Page index, clamped so it stays valid as filters/sort/page size change. */
  readonly clampedPage = computed(() => Math.min(this.page(), this.pageCount() - 1));

  readonly pagedCars = computed(() => {
    const all = this.state.visibleCars();
    const size = this.pageSize();
    const start = this.clampedPage() * size;
    return all.slice(start, start + size);
  });

  /** Indexes for the placeholder rows needed to always show exactly
   * `pageSize` rows in the table, even when the current page has fewer
   * cars than that (e.g. the last page). Keeps every row the same fixed
   * height instead of letting the few real rows stretch to fill the
   * body. */
  readonly emptyRowIndexes = computed(() => {
    const missing = this.pageSize() - this.pagedCars().length;
    return missing > 0 ? Array.from({ length: missing }, (_, i) => i) : [];
  });

  readonly rangeLabel = computed(() => {
    const total = this.state.visibleCars().length;
    if (total === 0) return '0';
    const size = this.pageSize();
    const start = this.clampedPage() * size + 1;
    const end = Math.min(start + size - 1, total);
    return `${start}\u2013${end}`;
  });

  /** Returns the last two digits of a year, zero-padded (e.g. 1990 → '90', 2000 → '00'). */
  shortYear(year: number): string {
    return String(year).slice(-2);
  }

  constructor(public state: GarageStateService, private api: GarageApiService, private audio: AudioService) {
    // Reset to page 1 only when the user changes filters, search, sort, or
    // column choice — NOT when the underlying car list is updated in place
    // (e.g. after editing a car), which previously also reset the page.
    effect(() => {
      this.state.filterCountryId();
      this.state.filterBrandId();
      this.state.filterDrivetrain();
      this.state.searchTerm();
      this.state.sort();
      this.state.columnB();
      this.state.columnC();
      this.state.columnD();
      this.page.set(0);
    }, { allowSignalWrites: true });
  }

  nextPage(): void {
    if (this.clampedPage() < this.pageCount() - 1) {
      this.audio.playSfx('move');
      this.page.set(this.clampedPage() + 1);
    }
  }

  prevPage(): void {
    if (this.clampedPage() > 0) {
      this.audio.playSfx('move');
      this.page.set(this.clampedPage() - 1);
    }
  }

  flagFor(countryName: string): string {
    return flagAssetPath(countryName);
  }

  logoUrl(brandName: string): string {
    return this.api.brandLogoUrl(brandName);
  }

  onRowClick(carId: number): void {
    this.audio.playSfx('select');
    this.state.selectCar(carId);
  }

  onEditClick(car: Car): void {
    this.audio.playSfx('select');
    this.edit.emit(car);
  }

  onRemoveClick(car: Car): void {
    this.audio.playSfx('select');
    this.remove.emit(car);
  }

  /** Closes any open column picker when the user clicks anywhere outside it. */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.openPicker.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openPicker.set(null);
  }

  togglePicker(column: PickerColumn, event: Event): void {
    event.stopPropagation();
    this.audio.playSfx('select');
    this.openPicker.set(this.openPicker() === column ? null : column);
  }

  pickColumnB(value: ColumnBKey): void {
    this.audio.playSfx('select');
    this.state.setColumnB(value);
    this.openPicker.set(null);
  }

  pickColumnC(value: ColumnCKey): void {
    this.audio.playSfx('select');
    this.state.setColumnC(value);
    this.openPicker.set(null);
  }

  pickColumnD(value: ColumnDKey): void {
    this.audio.playSfx('select');
    this.state.setColumnD(value);
    this.openPicker.set(null);
  }

  invertOrder(event: Event): void {
    event.stopPropagation();
    this.audio.playSfx('select');
    this.state.invertOrder();
  }

  columnBLabel(): string {
    return this.state.columnB() === 'engine' ? 'Engine' : 'Drivetrain';
  }

  columnBValue(car: Car): string {
    return this.state.columnB() === 'engine'
      ? `${car.engineName} (${engineLayoutLabel(car.engineLayout)})`
      : drivetrainLabel(car.drivetrain);
  }

  columnCLabel(): string {
    const c = this.state.columnC();
    return c === 'hp' ? 'Power' : c === 'torque' ? 'Torque' : c === 'rpm' ? 'RPM' : 'Category';
  }

  columnCValue(car: Car): string | number {
    const c = this.state.columnC();
    if (c === 'category') return car.category ?? '—';
    return c === 'hp' ? car.horsepower : c === 'torque' ? car.torqueNm : car.rpmMax;
  }

  columnCUnit(): string {
    const c = this.state.columnC();
    if (c === 'category') return '';
    return c === 'hp' ? 'HP' : c === 'torque' ? 'Nm' : 'rpm';
  }

  columnDLabel(): string {
    const d = this.state.columnD();
    return d === 'weight' ? 'Weight' : d === 'height' ? 'Height' : d === 'length' ? 'Length' : 'Width';
  }

  columnDValue(car: Car): number {
    const d = this.state.columnD();
    return d === 'weight'
      ? car.weightKg
      : d === 'height'
      ? car.dimensions.heightMm
      : d === 'length'
      ? car.dimensions.lengthMm
      : car.dimensions.widthMm;
  }

  columnDUnit(): string {
    return this.state.columnD() === 'weight' ? 'kg' : 'mm';
  }

  onDragStart(carId: number): void {
    this.draggingId.set(carId);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(targetId: number): void {
    const draggedId = this.draggingId();
    if (draggedId != null && draggedId !== targetId) {
      this.state.reorder(draggedId, targetId);
    }
    this.draggingId.set(null);
  }

  onDragEnd(): void {
    this.draggingId.set(null);
  }
}
