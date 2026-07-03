import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

/**
 * Small floating notification, e.g. "Car saved" or an error message.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gt-toast" [class.is-visible]="visible()" [class.is-error]="isError()">
      {{ message() }}
    </div>
  `,
})
export class ToastComponent {
  private readonly _message = signal('');
  private readonly _visible = signal(false);
  private readonly _isError = signal(false);
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  readonly message = this._message.asReadonly();
  readonly visible = this._visible.asReadonly();
  readonly isError = this._isError.asReadonly();

  show(message: string, isError = false, durationMs = 3200): void {
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    this._message.set(message);
    this._isError.set(isError);
    this._visible.set(true);
    this.timeoutHandle = setTimeout(() => this._visible.set(false), durationMs);
  }
}
