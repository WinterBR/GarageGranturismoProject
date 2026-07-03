export const environment = {
  production: false,
  /**
   * Base URL of the garage-service backend.
   * Matches the default server.port=8080 in the backend's application.yml.
   * Override here if your backend runs on a different host/port.
   */
  apiBaseUrl: 'http://localhost:8080/api/v1',
  /**
   * Fallback refresh interval (ms) used only if a stored session is found
   * without an expiresInMs value. Matches the backend's default 5-minute
   * token lifetime (app.security.jwt.expiration-ms); the real value always
   * comes from the login/refresh response itself.
   */
  tokenRefreshIntervalMs: 5 * 60 * 1000,
};
