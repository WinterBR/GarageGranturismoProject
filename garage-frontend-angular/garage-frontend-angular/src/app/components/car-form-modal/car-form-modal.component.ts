import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Brand } from '../../models/brand.model';
import { Car, CarRequest } from '../../models/car.model';
import { DRIVETRAIN_OPTIONS, Drivetrain } from '../../models/drivetrain.model';
import { ENGINE_LAYOUT_OPTIONS, EngineLayout } from '../../models/engine-layout.model';
import { GarageApiService } from '../../services/garage-api.service';
import { GarageStateService } from '../../services/garage-state.service';
import { AudioService } from '../../services/audio.service';
import { ColorBandEditorComponent } from '../color-rect/color-band-editor.component';
import { RACING_CATEGORIES } from '../../models/racing-categories.model';

interface CarFormModel {
  name: string;
  brandId: number | null;
  colorHex: string;
  creationYear: number | null;
  horsepower: number | null;
  drivetrain: Drivetrain | null;
  torqueNm: number | null;
  rpmMax: number | null;
  engineName: string;
  engineLayout: EngineLayout | null;
  weightKg: number | null;
  heightMm: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  wikiUrl: string;
  category: string | null;
}

function emptyForm(): CarFormModel {
  return {
    name: '',
    brandId: null,
    colorHex: '#C40233',
    creationYear: null,
    horsepower: null,
    drivetrain: null,
    torqueNm: null,
    rpmMax: null,
    engineName: '',
    engineLayout: null,
    weightKg: null,
    heightMm: null,
    lengthMm: null,
    widthMm: null,
    wikiUrl: '',
    category: null,
  };
}

@Component({
  selector: 'app-car-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorBandEditorComponent],
  template: `
    <div class="gt-modal-overlay" [class.is-open]="open()">
      <div class="gt-modal">
        <div class="gt-modal__header">
          <h2>{{ editingCar() ? 'Edit Car' : 'New Car' }}</h2>
          <button type="button" class="gt-modal__close" (click)="close()">&times;</button>
        </div>

        <form class="gt-modal__body" (ngSubmit)="save()" #formRef="ngForm">
          <div class="gt-form-section__title">Identity</div>

          <div class="gt-form-row">
            <label>Car name</label>
            <input
              type="text"
              name="name"
              required
              maxlength="120"
              placeholder="e.g. Toyota Supra RZ"
              [(ngModel)]="form.name"
            />
          </div>

          <div class="gt-form-row">
            <label>Brand</label>
            <select name="brandId" required [(ngModel)]="form.brandId" (change)="onFieldSelect()">
              <option [ngValue]="null" disabled>Select a brand...</option>
              @for (brand of brands(); track brand.id) {
                <option [ngValue]="brand.id">{{ brand.name }} ({{ brand.country.name }})</option>
              }
            </select>
          </div>

          <div class="gt-form-row">
            <label>Color</label>
            <app-color-band-editor [colorHex]="form.colorHex" (colorHexChange)="form.colorHex = $event">
            </app-color-band-editor>
          </div>

          <div class="gt-form-row gt-form-row--split">
            <div class="gt-form-col--narrow">
              <label>Creation year</label>
              <input type="number" name="creationYear" min="1885" max="2100" required placeholder="1997" [(ngModel)]="form.creationYear" />
            </div>
            <div class="gt-form-col--wide">
              <label>Drivetrain</label>
              <select name="drivetrain" required [(ngModel)]="form.drivetrain" (change)="onFieldSelect()">
                <option [ngValue]="null" disabled>Select...</option>
                @for (opt of drivetrainOptions; track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }} &mdash; {{ opt.description }}</option>
                }
              </select>
            </div>
          </div>

          <div class="gt-form-section__title">Engine &amp; performance</div>

          <div class="gt-form-row gt-form-row--split">
            <div>
              <label>Horsepower</label>
              <input type="number" name="horsepower" min="1" required placeholder="280" [(ngModel)]="form.horsepower" />
            </div>
            <div>
              <label>Torque (Nm)</label>
              <input type="number" name="torqueNm" min="1" required placeholder="431" [(ngModel)]="form.torqueNm" />
            </div>
          </div>

          <div class="gt-form-row gt-form-row--split">
            <div class="gt-form-col--narrow">
              <label>Max RPM</label>
              <input type="number" name="rpmMax" min="1" required placeholder="6800" [(ngModel)]="form.rpmMax" />
            </div>
            <div class="gt-form-col--wide">
              <label>Engine layout</label>
              <select name="engineLayout" required [(ngModel)]="form.engineLayout" (change)="onFieldSelect()">
                <option [ngValue]="null" disabled>Select...</option>
                @for (opt of engineLayoutOptions; track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }} &mdash; {{ opt.description }}</option>
                }
              </select>
            </div>
          </div>

          <div class="gt-form-row">
            <label>Engine name</label>
            <input
              type="text"
              name="engineName"
              required
              maxlength="100"
              placeholder="2JZ-GTE Twin-Turbo"
              [(ngModel)]="form.engineName"
            />
          </div>

          <div class="gt-form-section__title">Dimensions</div>

          <div class="gt-form-row gt-form-row--split">
            <div>
              <label>Weight (kg)</label>
              <input type="number" name="weightKg" min="1" required placeholder="1510" [(ngModel)]="form.weightKg" />
            </div>
            <div>
              <label>Height (mm)</label>
              <input type="number" name="heightMm" min="1" required placeholder="1275" [(ngModel)]="form.heightMm" />
            </div>
          </div>

          <div class="gt-form-row gt-form-row--split">
            <div>
              <label>Length (mm)</label>
              <input type="number" name="lengthMm" min="1" required placeholder="4520" [(ngModel)]="form.lengthMm" />
            </div>
            <div>
              <label>Width (mm)</label>
              <input type="number" name="widthMm" min="1" required placeholder="1810" [(ngModel)]="form.widthMm" />
            </div>
          </div>

          <div class="gt-form-section__title">Extras (optional)</div>

          <div class="gt-form-row">
            <label>Category</label>
            <select name="category" [(ngModel)]="form.category" (change)="onFieldSelect()">
              <option [ngValue]="null">No category</option>
              @for (cat of racingCategories; track cat.value) {
                <option [ngValue]="cat.value">{{ cat.label }}</option>
              }
            </select>
          </div>

          <div class="gt-form-row">
            <label>Wiki Link <span class="gt-label-optional">(optional)</span></label>
            <input
              type="url"
              name="wikiUrl"
              maxlength="512"
              placeholder="https://en.wikipedia.org/wiki/..."
              [(ngModel)]="form.wikiUrl"
            />
          </div>

          @if (errorMessage()) {
            <p class="gt-form-error">{{ errorMessage() }}</p>
          }

          <div class="gt-modal__footer">
            <button type="button" class="gt-btn gt-btn--ghost" (click)="close()">Cancel</button>
            <button type="submit" class="gt-btn gt-btn--confirm" [disabled]="formRef.invalid || saving()">
              {{ saving() ? 'Saving...' : 'Save car' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .gt-form-error {
        margin: 0;
        padding: 10px 12px;
        background: rgba(192, 57, 43, 0.18);
        border: 1px solid #C0392B;
        border-radius: 0;
        color: #ffb4ac;
        font-size: 20px;
        font-weight: 600;
      }
      select option {
        color: #1a1a1a;
      }
      .gt-modal {
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      }
      .gt-modal__body {
        overflow-y: auto;
        flex: 1 1 auto;
        padding-bottom: 8px;
      }
      .gt-modal__footer {
        flex-shrink: 0;
      }
      .gt-label-optional {
        font-size: 0.75em;
        opacity: 0.6;
        font-weight: 400;
      }
    `,
  ],
})
export class CarFormModalComponent {
  private readonly _open       = signal(false);
  private readonly _editingCar = signal<Car | null>(null);
  readonly saving       = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly open       = this._open.asReadonly();
  readonly editingCar = this._editingCar.asReadonly();

  readonly drivetrainOptions   = DRIVETRAIN_OPTIONS;
  readonly engineLayoutOptions = ENGINE_LAYOUT_OPTIONS;
  readonly racingCategories    = RACING_CATEGORIES;

  readonly brands = computed<Brand[]>(() =>
    [...this.state.brands()].sort((a, b) => a.name.localeCompare(b.name))
  );

  form: CarFormModel = emptyForm();

  @Output() saved = new EventEmitter<Car>();

  constructor(
    private state: GarageStateService,
    private api:   GarageApiService,
    private audio: AudioService,
  ) {}

  openForCreate(): void {
    this.form = emptyForm();
    this._editingCar.set(null);
    this.errorMessage.set(null);
    this._open.set(true);
    this.audio.play('car-form');
  }

  openForEdit(car: Car): void {
    this.form = {
      name:         car.name,
      brandId:      car.brand.id,
      colorHex:     car.colorHex,
      creationYear: car.creationYear,
      horsepower:   car.horsepower,
      drivetrain:   car.drivetrain,
      torqueNm:     car.torqueNm,
      rpmMax:       car.rpmMax,
      engineName:   car.engineName,
      engineLayout: car.engineLayout,
      weightKg:     car.weightKg,
      heightMm:     car.dimensions.heightMm,
      lengthMm:     car.dimensions.lengthMm,
      widthMm:      car.dimensions.widthMm,
      wikiUrl:      car.wikiUrl ?? '',
      category:     car.category ?? null,
    };
    this._editingCar.set(car);
    this.errorMessage.set(null);
    this._open.set(true);
    this.audio.play('car-form');
  }

  close(): void {
    this._open.set(false);
    this.audio.playSfx('back');
    this.audio.play('garage');   // volta para a música da garagem
  }

  /** Same UI transition as close(), but used right after a successful save —
   * the 'purchase' sfx already played, so we don't also play 'back' here. */
  private closeAfterSave(): void {
    this._open.set(false);
    this.audio.play('garage');
  }

  /** Generic click/selection sound for native dropdowns inside the form. */
  onFieldSelect(): void {
    this.audio.playSfx('select');
  }

  save(): void {
    const f = this.form;
    if (
      f.brandId      == null ||
      f.creationYear == null ||
      f.horsepower   == null ||
      f.drivetrain   == null ||
      f.torqueNm     == null ||
      f.rpmMax       == null ||
      f.engineLayout == null ||
      f.weightKg     == null ||
      f.heightMm     == null ||
      f.lengthMm     == null ||
      f.widthMm      == null
    ) {
      this.errorMessage.set('Please fill in every field before saving.');
      this.audio.playSfx('error');
      return;
    }

    const request: CarRequest = {
      name:         f.name,
      brandId:      f.brandId,
      colorHex:     f.colorHex,
      creationYear: f.creationYear,
      horsepower:   f.horsepower,
      drivetrain:   f.drivetrain,
      torqueNm:     f.torqueNm,
      rpmMax:       f.rpmMax,
      engineName:   f.engineName,
      engineLayout: f.engineLayout,
      weightKg:     f.weightKg,
      heightMm:     f.heightMm,
      lengthMm:     f.lengthMm,
      widthMm:      f.widthMm,
      wikiUrl:      f.wikiUrl || null,
      category:     f.category || null,
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    const editing = this._editingCar();
    if (editing) {
      this.state.updateCar(
        editing.id,
        request,
        (car) => {
          this.saving.set(false);
          this.audio.playSfx('purchase');
          this.saved.emit(car);
          this.closeAfterSave();
        },
        (msg) => {
          this.saving.set(false);
          this.audio.playSfx('error');
          this.errorMessage.set(msg);
        },
      );
    } else {
      this.state.createCar(
        request,
        (car) => {
          this.saving.set(false);
          this.audio.playSfx('purchase');
          this.saved.emit(car);
          this.closeAfterSave();
        },
        (msg) => {
          this.saving.set(false);
          this.audio.playSfx('error');
          this.errorMessage.set(msg);
        },
      );
    }
  }
}
