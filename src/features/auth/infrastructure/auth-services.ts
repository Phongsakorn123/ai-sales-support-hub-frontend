import type { LoginResult, RegistrationInput } from "@/features/auth/domain/auth-repository";
import { loginAccount } from "@/features/auth/infrastructure/login-api";
import { registerAccount } from "@/features/auth/infrastructure/register-api";
import {
  clearAccessToken,
  getAccessToken,
  getAccessTokenExpiration,
  getSessionVersion,
  hasLocalSession,
  storeAccessToken,
  subscribeToSession,
} from "@/features/auth/infrastructure/session";
import { AuthenticationRequiredError, fetchProtectedApi } from "@/lib/api/protected-fetch";

export interface AuthApiService {
  login(identifier: string, password: string): Promise<LoginResult>;
  register(input: RegistrationInput): Promise<void>;
}

export interface SessionService {
  saveAccessToken(token: string): void;
  clearSession(): void;
  hasSession(): boolean;
  getVersion(): number;
  subscribe(listener: () => void): () => void;
  getExpiry(): number | null;
  verify(): Promise<boolean>;
}

export class HttpAuthApiService implements AuthApiService {
  login(identifier: string, password: string): Promise<LoginResult> {
    return loginAccount(identifier, password);
  }

  register(input: RegistrationInput): Promise<void> {
    return registerAccount(input);
  }
}

export class BrowserSessionService implements SessionService {
  saveAccessToken(token: string): void {
    storeAccessToken(token);
  }

  clearSession(): void {
    clearAccessToken();
  }

  hasSession(): boolean {
    return hasLocalSession();
  }

  getVersion(): number {
    return getSessionVersion();
  }

  subscribe(listener: () => void): () => void {
    return subscribeToSession(listener);
  }

  getExpiry(): number | null {
    const token = getAccessToken();
    return token ? getAccessTokenExpiration(token) : null;
  }

  async verify(): Promise<boolean> {
    try {
      const response = await fetchProtectedApi("/api/auth/me", { method: "GET" });
      return response.ok;
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) return false;
      throw error;
    }
  }
}
