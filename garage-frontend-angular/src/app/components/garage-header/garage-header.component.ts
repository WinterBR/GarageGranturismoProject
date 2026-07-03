import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GarageApiService } from '../../services/garage-api.service';
import { GarageStateService } from '../../services/garage-state.service';
import { AudioService } from '../../services/audio.service';
import { ColorRectComponent } from '../color-rect/color-rect.component';

/**
 * Top header bar: "Garage" title plus the GT4-style "currently selected
 * car" strip (brand logo, color, name, year), today's date, a music
 * mute toggle, and a logout control for the single signed-in admin session.
 */
@Component({
  selector: 'app-garage-header',
  standalone: true,
  imports: [CommonModule, ColorRectComponent],
  template: `
    <header class="gt-header">
      <div class="gt-header__title-wrap">
        <h1 class="gt-title">Garage</h1>
      </div>

      <div class="gt-header__current">
        @if (selectedCar(); as car) {
          <img class="gt-header__brand-logo" [src]="logoUrl(car.brand.name)" [alt]="car.brand.name" />
          <div class="gt-header__color">
            <app-color-rect [colorHex]="car.colorHex" [height]="34"></app-color-rect>
          </div>
          <span>{{ car.name }}</span>
          <span class="gt-header__year-wrap">
            <span class="gt-cell--year">{{ car.creationYear }}</span>
            @if (car.wikiUrl) {
              <a
                class="gt-header__wiki-link"
                [href]="car.wikiUrl"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Wiki page"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-label="Wiki link">
                  <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/>
                </svg>
              </a>
            }
          </span>
        }
        <span class="gt-header__date">
          <span class="gt-date-day">{{ today.day }}</span>
          <span class="gt-date-month">{{ today.month }}</span>
        </span>
        <button
          type="button"
          class="gt-btn gt-btn--ghost gt-header__mute"
          [class.is-muted]="musicMuted()"
          [title]="musicMuted() ? 'Unmute music' : 'Mute music'"
          (click)="onToggleMute()"
        >
          @if (musicMuted()) {
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M16.5 12L20 8.5 18.59 7.09 15.17 10.5 11.76 7.09 10.34 8.5 13.76 12l-3.42 3.41 1.41 1.42 3.42-3.42 3.41 3.42L20 15.41z"/>
              <path d="M3 9v6h4l5 5V4L7 9H3z"/>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          }
        </button>
        <button type="button" class="gt-btn gt-btn--ghost gt-header__logout" (click)="onLogout()">
          Log out
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      .gt-header__logout {
        margin-left: 14px;
        font-size: 16px;
        padding: 6px 14px;
      }

      .gt-header__mute {
        margin-left: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
      }
      .gt-header__mute.is-muted { color: #c0392b; }
      .gt-header__year-wrap {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .gt-header__wiki-link {
        display: inline-flex;
        align-items: center;
        color: inherit;
        opacity: 0.65;
        text-decoration: none;
        line-height: 1;
        transition: opacity 0.15s;
      }
      .gt-header__wiki-link:hover { opacity: 1; }
    `,
  ],
})
export class GarageHeaderComponent {
  readonly today: { day: number; month: string };

  readonly selectedCar = this.state.selectedCar;

  @Output() logout = new EventEmitter<void>();

  constructor(
    private state: GarageStateService,
    private api: GarageApiService,
    private audio: AudioService,
  ) {
    const now = new Date();
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];
    this.today = { day: now.getDate(), month: months[now.getMonth()] };
  }

  logoUrl(brandName: string): string {
    return this.api.brandLogoUrl(brandName);
  }

  musicMuted(): boolean {
    return this.audio.musicMuted();
  }

  onToggleMute(): void {
    this.audio.playSfx('select');
    this.audio.toggleMusicMute();
  }

  onLogout(): void {
    this.audio.playSfx('select');
    this.logout.emit();
  }
}
