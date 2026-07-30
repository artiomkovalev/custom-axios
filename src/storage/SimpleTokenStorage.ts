import { TokenStorage } from './TokenStorage';
import { apiConfig } from '@/config/api';
import { isServer } from '@/utils/environment';

export class SimpleTokenStorage extends TokenStorage {
  private getStorage(): Storage | null {
    if (isServer()) {
      return null;
    }
    return localStorage;
  }

  public getAccessToken(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;
    const { authTokenKey } = apiConfig.getConfig();
    return storage.getItem(authTokenKey);
  }

  public setAccessToken(token: string): void {
    const storage = this.getStorage();
    if (!storage) return;
    const { authTokenKey } = apiConfig.getConfig();
    storage.setItem(authTokenKey, token);
  }

  public getRefreshToken(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;
    const { refreshTokenKey } = apiConfig.getConfig();
    return storage.getItem(refreshTokenKey);
  }

  public setRefreshToken(token: string): void {
    const storage = this.getStorage();
    if (!storage) return;
    const { refreshTokenKey } = apiConfig.getConfig();
    storage.setItem(refreshTokenKey, token);
  }

  public clearTokens(): void {
    const storage = this.getStorage();
    if (!storage) return;
    const { authTokenKey, refreshTokenKey } = apiConfig.getConfig();
    storage.removeItem(authTokenKey);
    storage.removeItem(refreshTokenKey);
  }
}
