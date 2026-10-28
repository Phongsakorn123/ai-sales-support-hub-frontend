import type { DashboardPreferencesRepository } from "@/features/dashboard/domain/dashboard-preferences-repository";
import type { DashboardPreferencesService } from "@/features/dashboard/infrastructure/dashboard-preferences-service";

const VOICE_LANGUAGE_KEY = "voice-search-language";

export class BrowserDashboardPreferencesRepository implements DashboardPreferencesRepository {
  constructor(private readonly service: DashboardPreferencesService) {}

  getVoiceLanguage(): string | null {
    return this.service.read(VOICE_LANGUAGE_KEY);
  }

  saveVoiceLanguage(language: string): void {
    this.service.write(VOICE_LANGUAGE_KEY, language);
  }
}
