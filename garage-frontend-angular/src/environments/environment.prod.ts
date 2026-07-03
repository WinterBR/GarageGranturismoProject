export const environment = {
  production: true,
  /**
   * In production, point this to wherever garage-service is deployed.
   * Can also be swapped for a relative '/api/v1' if the frontend is
   * served behind the same reverse proxy as the backend.
   */
  apiBaseUrl: 'https://garagegranturismoproject.onrender.com/api/v1',
  /**
   * Fallback refresh interval (ms) used only if a stored session is found
   * without an expiresInMs value. Matches the backend's default 5-minute
   * token lifetime (app.security.jwt.expiration-ms); the real value always
   * comes from the login/refresh response itself.
   */
  tokenRefreshIntervalMs: 5 * 60 * 1000,
};
