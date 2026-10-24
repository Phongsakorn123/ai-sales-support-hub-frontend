export class LoginApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginApiError";
  }
}

export interface LoginTokenResponse {
  access_token: string;
  token_type: "bearer";
}

export function isLoginTokenResponse(
  value: unknown,
): value is LoginTokenResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tokenResponse = value as Record<string, unknown>;
  return (
    typeof tokenResponse.access_token === "string" &&
    tokenResponse.access_token.length > 0 &&
    tokenResponse.token_type === "bearer"
  );
}

export async function loginAccount(
  identifier: string,
  password: string,
): Promise<LoginTokenResponse> {
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: identifier, password }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new LoginApiError(
        "Unable to reach the sign-in service. Check your connection and try again.",
      );
    }
    throw error;
  }

  if (response.ok) {
    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new LoginApiError(
        "The sign-in service returned an invalid response. Please try again later.",
      );
    }

    if (isLoginTokenResponse(result)) {
      return result;
    }

    throw new LoginApiError(
      "The sign-in service returned an invalid response. Please try again later.",
    );
  }

  if (response.status === 401) {
    throw new LoginApiError("Invalid username/email or password.");
  }

  if (response.status === 400 || response.status === 422) {
    throw new LoginApiError("Please enter your username or email and password.");
  }

  if (response.status >= 500) {
    throw new LoginApiError(
      "The sign-in service is temporarily unavailable. Please try again later.",
    );
  }

  throw new LoginApiError(
    "Unable to sign in. Please review your details and try again.",
  );
}
