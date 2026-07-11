/** Mirrors AuthDto.LoginRequest from the backend. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Mirrors AuthDto.TokenResponse from the backend. */
export interface TokenResponse {
  token: string;
  tokenType: string;
  /** How long this token stays valid for, in milliseconds. */
  expiresInMs: number;
  username: string;
}
