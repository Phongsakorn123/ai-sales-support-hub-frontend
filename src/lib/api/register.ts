export class RegistrationApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationApiError";
  }
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export async function registerAccount(
  payload: RegisterPayload,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new RegistrationApiError(
        "Unable to reach the registration service. Check your connection and try again.",
      );
    }
    throw error;
  }

  if (response.status === 201) {
    return;
  }

  if (response.status === 409) {
    throw new RegistrationApiError(
      "This username or email is already registered. Try another one or sign in.",
    );
  }

  if (response.status === 422) {
    throw new RegistrationApiError(
      "Please check your username, email, and password and try again.",
    );
  }

  if (response.status === 400) {
    throw new RegistrationApiError(
      "Please check your username, email, and password and try again.",
    );
  }

  if (response.status >= 500) {
    throw new RegistrationApiError(
      "The registration service is temporarily unavailable. Please try again later.",
    );
  }

  throw new RegistrationApiError(
    "We couldn’t create your account. Please review your details and try again.",
  );
}
