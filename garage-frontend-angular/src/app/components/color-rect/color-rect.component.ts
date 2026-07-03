import { Component, Input, computed, signal } from '@angular/core';
import { ColorBand, parseColorBands } from '../../models/color-bands.model';

/**
 * Renders the GT4-style vertical color rectangle: a thin column split
 * into horizontal bands, one per color, sized by their percentage.
 * Used in the car table instead of showing the color's name.
 */
@Component({
  selector: 'app-color-rect',
  standalone: true,
  template: `
    <div class="gt-color-rect" [style.height.px]="height">
      @for (band of bands(); track $index) {
        <div class="gt-color-rect__seg" [style.height.%]="band.percent" [style.background]="band.hex"></div>
      }
    </div>
  `,
})
export class ColorRectComponent {
  private readonly _colorHex = signal<string>('#888888');

  @Input() set colorHex(value: string | null | undefined) {
    this._colorHex.set(value ?? '#888888');
  }

  @Input() height = 34;

  readonly bands = computed<ColorBand[]>(() => parseColorBands(this._colorHex()));
}
