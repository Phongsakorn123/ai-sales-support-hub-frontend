import type { AuthRepository, LoginResult, RegistrationInput } from "@/features/auth/domain/auth-repository";
import type { AuthApiService, SessionService } from "@/features/auth/infrastructure/auth-services";

export class AuthApiRepository implements AuthRepository {
  constructor(
    private readonly api: AuthApiService,
    private readonly session: SessionService,
  ) {}

  login(identifier: string, password: string): Promise<LoginResult> {
    return this.api.login(identifier, password);
  }

  register(input: RegistrationInput): Promise<void> {
    return this.api.register(input);
  }

  saveAccessToken(token: string): void {
    this.session.saveAccessToken(token);
  }

  clearSession(): void {
    this.session.clearSession();
  }

  hasSession(): boolean {
    return this.session.hasSession();
  }

  getSessionVersion(): number {
    return this.session.getVersion();
  }

  subscribeToSession(listener: () => void): () => void {
    return this.session.subscribe(listener);
  }

  getSessionExpiry(): number | null {
    return this.session.getExpiry();
  }

  verifySession(): Promise<boolean> {
    return this.session.verify();
  }
}
