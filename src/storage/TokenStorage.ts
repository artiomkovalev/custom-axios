export abstract class TokenStorage {
  abstract getAccessToken(): string | null;
  abstract setAccessToken(token: string): void;

  abstract getRefreshToken(): string | null;
  abstract setRefreshToken(token: string): void;

  abstract clearTokens(): void;
}
