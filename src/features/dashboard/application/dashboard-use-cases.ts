import type { DashboardPreferencesRepository } from "@/features/dashboard/domain/dashboard-preferences-repository";

export interface DashboardUseCasesPort {
  getVoiceLanguage(): string | null;
  saveVoiceLanguage(language: string): void;
}

export class DashboardUseCases implements DashboardUseCasesPort {
  constructor(private readonly preferences: DashboardPreferencesRepository) {}

  getVoiceLanguage(): string | null {
    return this.preferences.getVoiceLanguage();
  }

  saveVoiceLanguage(language: string): void {
    this.preferences.saveVoiceLanguage(language);
  }
}
