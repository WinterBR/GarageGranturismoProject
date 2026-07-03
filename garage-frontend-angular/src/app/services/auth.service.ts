import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, TokenResponse } from '../models/auth.model';

const STORAGE_KEY = 'garage_auth_token';

interface StoredSession {
  token: string;
  expiresInMs: number;
}

/**
 * Handles the whole client-side session lifecycle for the single admin
 * user: logging in, holding the current JWT, and automatically refreshing
 * it in the background well before it expires (the backend issues tokens
 * valid for 5 minutes; this service schedules a refresh shortly before
 * that window closes so the user is never silently logged out mid-session).
 *
 * The token is kept in sessionStorage (not localStorage): it survives a
 * page reload within the same tab, but disappears once the tab/browser is
 * closed, and is never shared across tabs — a reasonable middle ground for
 * a small internal tool with a single shared account.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  /** Reactive "am I logged in" flag, used by the auth guard and the app shell. */
  readonly isAuthenticated = signal<boolean>(this.readStoredSession() !== null);

  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  // Refresh a bit before actual expiry so a slow request never races the
  // token's expiration. 30s of headroom is plenty for a 5-minute token.
  private static readonly REFRESH_SAFETY_MARGIN_MS = 30_000;

  constructor(private http: HttpClient) {
    // If a token is already in storage (e.g. page was reloaded), resume
    // the refresh cycle immediately so the session keeps itself alive.
    const session = this.readStoredSession();
    if (session) {
      this.scheduleRefresh(session.expiresInMs ?? environment.tokenRefreshIntervalMs);
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((response) => this.handleNewToken(response)),
    );
  }

  /** Asks the backend for a brand-new token using the current (still valid) one. */
  refresh(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/refresh`, {}).pipe(
      tap((response) => this.handleNewToken(response)),
      catchError((err) => {
        // If refresh fails (token already expired, network error, etc.),
        // the safest thing is to force a clean re-login rather than keep
        // the user in a half-authenticated state.
        this.logout();
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.isAuthenticated.set(false);
    if (this.refreshTimerId !== null) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  getToken(): string | null {
    return this.readStoredSession()?.token ?? null;
  }

  // ---------------------------------------------------------------- internals

  private handleNewToken(response: TokenResponse): void {
    const session: StoredSession = { token: response.token, expiresInMs: response.expiresInMs };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.isAuthenticated.set(true);
    this.scheduleRefresh(response.expiresInMs);
  }

  private scheduleRefresh(expiresInMs: number): void {
    if (this.refreshTimerId !== null) clearTimeout(this.refreshTimerId);
    const delay = Math.max(expiresInMs - AuthService.REFRESH_SAFETY_MARGIN_MS, 5_000);
    this.refreshTimerId = setTimeout(() => {
      this.refresh().subscribe({ error: () => {} });
    }, delay);
  }

  /** Parses the session once; all callers share this single parse. */
  private readStoredSession(): StoredSession | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.token ? (parsed as StoredSession) : null;
    } catch {
      return null;
    }
  }
}
