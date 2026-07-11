import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gt-login-screen" (click)="onFirstInteraction()">
      <button
        type="button"
        class="gt-mute-btn"
        [class.is-muted]="musicMuted()"
        [title]="musicMuted() ? 'Unmute music' : 'Mute music'"
        (click)="onToggleMute($event)"
      >
        @if (musicMuted()) {
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M16.5 12L20 8.5 18.59 7.09 15.17 10.5 11.76 7.09 10.34 8.5 13.76 12l-3.42 3.41 1.41 1.42 3.42-3.42 3.41 3.42L20 15.41z"/>
            <path d="M3 9v6h4l5 5V4L7 9H3z"/>
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        }
      </button>

      <div class="gt-login-panel">
        <h1 class="gt-login-title">Garage</h1>
        <p class="gt-login-subtitle">Sign in to continue</p>

        <form class="gt-login-form" (ngSubmit)="submit()" #formRef="ngForm">
          <div class="gt-form-row">
            <label>Username</label>
            <input
              type="text"
              name="username"
              required
              autocomplete="username"
              placeholder="admin"
              [(ngModel)]="username"
              [disabled]="loading()"
              #usernameField
            />
          </div>

          <div class="gt-form-row">
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              autocomplete="current-password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              [(ngModel)]="password"
              [disabled]="loading()"
            />
          </div>

          @if (errorMessage()) {
            <p class="gt-form-error">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            class="gt-btn gt-btn--confirm gt-login-submit"
            [disabled]="formRef.invalid || loading()"
          >
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .gt-login-screen {
        width: 100%;
        height: 125vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background:
          radial-gradient(ellipse at center, rgba(15, 15, 15, 0.35) 0%, rgba(8, 8, 8, 0.8) 75%),
          url('/assets/backgrounds/garage-login-bg.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }

      .gt-mute-btn {
        position: absolute;
        top: 22px;
        right: 28px;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        color: #d6d6d6;
        border: 1px solid #000;
        border-radius: 0;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        cursor: var(--gt-cursor);
        z-index: 2;
      }
      .gt-mute-btn:hover { filter: brightness(1.2); }
      .gt-mute-btn.is-muted { color: #c0392b; }

      .gt-login-panel {
        width: 380px;
        padding: 36px 40px 40px;
        background: #1a1a1a;
        border: 1px solid #000;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.04);
      }

      .gt-login-title {
        margin: 0;
        font-family: "Times New Roman", Times, serif;
        font-weight: 100;
        font-size: 48px;
        color: #fff;
        text-align: center;
        text-shadow: 3px 4px 2px rgba(0, 0, 0, 0.5);
      }

      .gt-login-subtitle {
        margin: 4px 0 28px;
        text-align: center;
        color: var(--row-text-dim);
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .gt-login-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .gt-login-submit {
        margin-top: 6px;
        width: 100%;
        text-align: center;
      }

      .gt-form-error {
        margin: 0;
        padding: 10px 12px;
        background: rgba(192, 57, 43, 0.18);
        border: 1px solid #c0392b;
        border-radius: 0;
        color: #ffb4ac;
        font-size: 16px;
        font-weight: 600;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';

  readonly loading      = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router:      Router,
    private audio:       AudioService,
  ) {}

  ngOnInit(): void {
    this.audio.play('login');
  }

  /** Resume autoplay after first user gesture if the browser had blocked it. */
  onFirstInteraction(): void {
    this.audio.play('login');
  }

  musicMuted(): boolean {
    return this.audio.musicMuted();
  }

  onToggleMute(event: Event): void {
    event.stopPropagation();
    this.audio.playSfx('select');
    this.audio.toggleMusicMute();
  }

  submit(): void {
    if (!this.username || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.audio.playSfx('startup');
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.audio.playSfx('error');
        this.errorMessage.set(
          err.status === 401
            ? 'Invalid username or password.'
            : 'Could not sign in right now. Please try again.',
        );
      },
    });
  }
}
