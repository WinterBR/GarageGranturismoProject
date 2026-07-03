import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { Car } from '../../models/car.model';
import { GarageStateService } from '../../services/garage-state.service';
import { AudioService } from '../../services/audio.service';

/**
 * Confirmation modal shown before removing a car from the garage.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gt-modal-overlay" [class.is-open]="open()">
      <div class="gt-modal gt-modal--small">
        <div class="gt-modal__header">
          <h2>Remove car</h2>
        </div>
        <div class="gt-modal__body">
          @if (target(); as car) {
            <p>Remove <strong>{{ car.name }}</strong> ({{ car.creationYear }}) from the garage?</p>
            <p class="gt-modal__hint">This action cannot be undone.</p>
          }
        </div>
        <div class="gt-modal__footer">
          <button type="button" class="gt-btn gt-btn--ghost" (click)="close()">Cancel</button>
          <button type="button" class="gt-btn gt-btn--danger" (click)="confirm()">Remove</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  private readonly _open = signal(false);
  private readonly _target = signal<Car | null>(null);

  readonly open = this._open.asReadonly();
  readonly target = this._target.asReadonly();

  @Output() deleted = new EventEmitter<Car>();
  @Output() failed = new EventEmitter<string>();

  constructor(private state: GarageStateService, private audio: AudioService) {}

  show(car: Car): void {
    this._target.set(car);
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
    this._target.set(null);
    this.audio.playSfx('back');
  }

  confirm(): void {
    const car = this._target();
    if (!car) return;
    this.state.deleteCar(
      car.id,
      () => {
        this.audio.playSfx('start');
        this.deleted.emit(car);
        this._open.set(false);
        this._target.set(null);
      },
      (msg) => {
        this.audio.playSfx('error');
        this.failed.emit(msg);
        this._open.set(false);
        this._target.set(null);
      }
    );
  }
}
