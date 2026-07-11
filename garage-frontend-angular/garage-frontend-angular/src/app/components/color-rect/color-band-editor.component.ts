import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { ColorBand, parseColorBands, serializeColorBands } from '../../models/color-bands.model';
import { ColorRectComponent } from '../color-rect/color-rect.component';
import { AudioService } from '../../services/audio.service';

/**
 * Lets the user compose a car's color as one or more bands with a
 * hex color and a percentage of the vertical rectangle each occupies —
 * mirrors the multi-color liveries shown in the GT4 reference screenshots.
 */
@Component({
  selector: 'app-color-band-editor',
  standalone: true,
  imports: [CommonModule, ColorRectComponent],
  template: `
    <div class="gt-color-editor">
      <app-color-rect [colorHex]="serialized()" [height]="64"></app-color-rect>

      <div class="gt-color-editor__bands">
        @for (band of bands(); track $index) {
          <div class="gt-color-editor__band">
            <input
              type="color"
              [value]="band.hex"
              (input)="onHexChange($index, $event)"
            />
            <input
              type="number"
              class="gt-color-editor__percent"
              min="1"
              max="100"
              [value]="band.percent | number: '1.0-0'"
              (input)="onPercentChange($index, $event)"
            />
            <span class="gt-color-editor__percent-sign">%</span>
            @if (bands().length > 1) {
              <button type="button" class="gt-icon-btn gt-icon-btn--danger" (click)="removeBand($index)">&times;</button>
            }
          </div>
        }

        @if (bands().length > 1) {
          <div class="gt-color-editor__total" [class.gt-color-editor__total--warn]="totalPercent() !== 100">
            Total: {{ totalPercent() }}%
            @if (totalPercent() !== 100) {
              <button type="button" class="gt-color-editor__normalize" (click)="normalize()">
                Normalizar
              </button>
            }
          </div>
        }
      </div>

      @if (bands().length < 4) {
        <button type="button" class="gt-btn gt-btn--ghost gt-color-editor__add" (click)="addBand()">
          + Add color band
        </button>
      }
    </div>
  `,
  styles: [
    `
      .gt-color-editor {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
      }
      .gt-color-editor__bands {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }
      .gt-color-editor__band {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .gt-color-editor__band input[type='color'] {
        width: 38px;
        height: 30px;
        padding: 2px;
        flex: none;
      }
      .gt-color-editor__percent {
        width: 56px !important;
        min-width: 56px !important;
        flex: none;
      }
      .gt-color-editor__percent-sign {
        font-size: 20px;
        font-weight: 700;
        color: #d6d6d6;
        flex: none;
      }
      .gt-color-editor__add {
        align-self: flex-start;
        font-size: 18px;
        padding: 6px 12px;
        white-space: nowrap;
        flex: none;
      }
      .gt-color-editor__total {
        font-size: 15px;
        color: #a0a0a0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .gt-color-editor__total--warn {
        color: #e8a838;
      }
      .gt-color-editor__normalize {
        background: none;
        border: 1px solid #e8a838;
        color: #e8a838;
        font-size: 13px;
        padding: 2px 8px;
        cursor: pointer;
        border-radius: 2px;
      }
      .gt-color-editor__normalize:hover {
        background: rgba(232, 168, 56, 0.12);
      }
    `,
  ],
})
export class ColorBandEditorComponent {
  private readonly _bands = signal<ColorBand[]>([{ hex: '#C40233', percent: 100 }]);

  @Input() set colorHex(value: string | null | undefined) {
    this._bands.set(parseColorBands(value));
  }

  @Output() colorHexChange = new EventEmitter<string>();

  readonly bands = this._bands.asReadonly();

  readonly totalPercent = computed(() =>
    Math.round(this._bands().reduce((sum, b) => sum + b.percent, 0))
  );

  constructor(private audio: AudioService) {}

  serialized(): string {
    return serializeColorBands(this._bands());
  }

  onHexChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const updated = this._bands().map((b, i) => (i === index ? { ...b, hex: value } : b));
    this._bands.set(updated);
    this.emit();
  }

  onPercentChange(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value) || 1;
    const updated = this._bands().map((b, i) => (i === index ? { ...b, percent: value } : b));
    this._bands.set(updated);
    this.emit();
  }

  addBand(): void {
    if (this._bands().length >= 4) return;
    this.audio.playSfx('select');
    const current = this._bands();
    const newPercent = 10;
    const remaining = 100 - newPercent;
    const total = current.reduce((s, b) => s + b.percent, 0);
    const scaled = current.map((b) => ({ ...b, percent: (b.percent / total) * remaining }));
    this._bands.set([...scaled, { hex: '#888888', percent: newPercent }]);
    this.emit();
  }

  removeBand(index: number): void {
    if (this._bands().length <= 1) return;
    this.audio.playSfx('select');
    const removed = this._bands().filter((_, i) => i !== index);
    const total = removed.reduce((s, b) => s + b.percent, 0);
    const normalized = removed.map((b) => ({ ...b, percent: (b.percent / total) * 100 }));
    this._bands.set(normalized);
    this.emit();
  }

  normalize(): void {
    const bands = this._bands();
    const total = bands.reduce((s, b) => s + b.percent, 0);
    if (total === 0) return;
    this._bands.set(bands.map((b) => ({ ...b, percent: (b.percent / total) * 100 })));
    this.emit();
  }

  private emit(): void {
    this.colorHexChange.emit(this.serialized());
  }
}
