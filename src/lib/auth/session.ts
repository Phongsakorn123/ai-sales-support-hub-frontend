const ACCESS_TOKEN_KEY = "ai-sales-support-hub.access-token";
const SESSION_CHANGE_EVENT = "auth-session-change";
let sessionVersion = 0;

function notifySessionChange(): void {
  sessionVersion += 1;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function storeAccessToken(accessToken: string): void {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  notifySessionChange();
}

export function getAccessToken(): string | null {
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  notifySessionChange();
}

export function subscribeToSession(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_CHANGE_EVENT, callback);
  };
}

export function getSessionVersion(): number {
  return sessionVersion;
}

export function hasLocalSession(): boolean {
  const accessToken = getAccessToken();
  return accessToken !== null && hasUnexpiredAccessToken(accessToken);
}

export function getAccessTokenExpiration(accessToken: string): number | null {
  const [, encodedPayload] = accessToken.split(".");
  if (!encodedPayload) {
    return null;
  }

  try {
    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );
    const binaryPayload = window.atob(paddedPayload);
    const payloadBytes = Uint8Array.from(binaryPayload, (character) =>
      character.charCodeAt(0),
    );
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      exp?: unknown;
    };

    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function hasUnexpiredAccessToken(accessToken: string): boolean {
  const expiresAt = getAccessTokenExpiration(accessToken);
  return expiresAt !== null && expiresAt > Date.now();
}
