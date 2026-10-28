export type RegistrationInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginResult = {
  access_token: string;
  token_type: "bearer";
};

export interface AuthRepository {
  login(identifier: string, password: string): Promise<LoginResult>;
  register(input: RegistrationInput): Promise<void>;
  saveAccessToken(token: string): void;
  clearSession(): void;
  hasSession(): boolean;
  getSessionVersion(): number;
  subscribeToSession(listener: () => void): () => void;
  getSessionExpiry(): number | null;
  verifySession(): Promise<boolean>;
}
