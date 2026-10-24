function errorResponse(message: string, status: number): Response {
  return Response.json({ detail: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let registrationData: unknown;
  try {
    registrationData = await request.json();
  } catch {
    return errorResponse("Invalid registration request.", 400);
  }

  if (
    typeof registrationData !== "object" ||
    registrationData === null ||
    !("username" in registrationData) ||
    !("email" in registrationData) ||
    !("password" in registrationData) ||
    typeof registrationData.username !== "string" ||
    registrationData.username.trim().length === 0 ||
    typeof registrationData.email !== "string" ||
    registrationData.email.trim().length === 0 ||
    typeof registrationData.password !== "string" ||
    registrationData.password.length === 0
  ) {
    return errorResponse("Username, email, and password are required.", 400);
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

  let backendResponse: Response;
  try {
    backendResponse = await fetch(
      new URL("/api/v1/auth/register", apiBaseUrl),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
        cache: "no-store",
      },
    );
  } catch {
    return errorResponse(
      "The registration service is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (backendResponse.status === 201) {
    return new Response(null, { status: 201 });
  }

  if (backendResponse.status === 409) {
    return errorResponse(
      "This username or email is already registered. Try another one or sign in instead.",
      409,
    );
  }

  if (backendResponse.status === 422) {
    return errorResponse(
      "Please check your username, email, and password and try again.",
      422,
    );
  }

  if (backendResponse.status >= 500) {
    return errorResponse(
      "The registration service is temporarily unavailable. Please try again later.",
      503,
    );
  }

  return errorResponse(
    "We couldn’t create your account. Please review your details and try again.",
    backendResponse.ok ? 502 : backendResponse.status,
  );
}
