import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Blocks access to the garage screen unless a token is present.
 * Doesn't validate the token's signature/expiry itself — that's the
 * backend's job on every request — it just keeps a logged-out user from
 * ever seeing the app shell before being redirected to /login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
