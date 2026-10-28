import type { AuthRepository, RegistrationInput } from "@/features/auth/domain/auth-repository";

export interface AuthUseCasesPort {
  login(identifier: string, password: string): ReturnType<AuthRepository["login"]>;
  register(input: RegistrationInput): Promise<void>;
  saveSession(token: string): void;
  logout(): void;
  hasSession(): boolean;
  getSessionVersion(): number;
  subscribeToSession(listener: () => void): () => void;
  getSessionExpiry(): number | null;
  verifySession(): Promise<boolean>;
}

export class AuthUseCases implements AuthUseCasesPort {
  constructor(private readonly repository: AuthRepository) {}

  login(identifier: string, password: string) {
    return this.repository.login(identifier, password);
  }

  register(input: RegistrationInput) {
    return this.repository.register(input);
  }

  saveSession(token: string): void {
    this.repository.saveAccessToken(token);
  }

  logout(): void {
    this.repository.clearSession();
  }

  hasSession(): boolean {
    return this.repository.hasSession();
  }

  getSessionVersion(): number {
    return this.repository.getSessionVersion();
  }

  subscribeToSession(listener: () => void): () => void {
    return this.repository.subscribeToSession(listener);
  }

  getSessionExpiry(): number | null {
    return this.repository.getSessionExpiry();
  }

  verifySession(): Promise<boolean> {
    return this.repository.verifySession();
  }
}
