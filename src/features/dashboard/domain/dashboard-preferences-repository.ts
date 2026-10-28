export interface DashboardPreferencesRepository {
  getVoiceLanguage(): string | null;
  saveVoiceLanguage(language: string): void;
}
