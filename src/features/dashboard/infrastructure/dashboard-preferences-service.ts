export interface DashboardPreferencesService {
  read(key: string): string | null;
  write(key: string, value: string): void;
}

export class BrowserDashboardPreferencesService implements DashboardPreferencesService {
  read(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  write(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }
}
