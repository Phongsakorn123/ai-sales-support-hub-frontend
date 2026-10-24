import {
  clearAccessToken,
  getAccessToken,
  hasUnexpiredAccessToken,
} from "@/lib/auth/session";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Sign in is required to continue.");
    this.name = "AuthenticationRequiredError";
  }
}

export async function fetchProtectedApi(
  input: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  const requestUrl = new URL(input.toString(), window.location.origin);
  if (requestUrl.origin !== window.location.origin) {
    throw new TypeError("Protected API requests must use same-origin routes.");
  }

  const accessToken = getAccessToken();
  if (!accessToken || !hasUnexpiredAccessToken(accessToken)) {
    clearAccessToken();
    window.location.replace("/login");
    throw new AuthenticationRequiredError();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(requestUrl, { ...init, headers });
  if (response.status === 401) {
    clearAccessToken();
    window.location.replace("/login");
  }

  return response;
}
