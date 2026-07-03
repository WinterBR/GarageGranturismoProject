import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Attaches "Authorization: Bearer <token>" to every request aimed at this
 * app's own backend (never to third-party URLs). The login endpoint itself
 * is skipped since there is no token yet at that point.
 *
 * On a 401 response — token missing, invalid, or expired and refresh
 * already failed — the user is bounced back to /login. This is the
 * client-side safety net behind AuthService's own refresh scheduling.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiCall = req.url.startsWith(environment.apiBaseUrl);
  const isLoginCall = req.url === `${environment.apiBaseUrl}/auth/login`;

  let outgoing = req;
  if (isApiCall && !isLoginCall) {
    const token = authService.getToken();
    if (token) {
      outgoing = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isApiCall && !isLoginCall) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
