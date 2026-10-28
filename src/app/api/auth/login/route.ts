import { isLoginTokenResponse } from "@/features/auth/infrastructure/login-api";

function errorResponse(message: string, status: number): Response {
  return Response.json({ detail: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid login request.", 400);
  }

  const username = formData.get("username");
  const password = formData.get("password");
  if (
    typeof username !== "string" ||
    username.trim().length === 0 ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return errorResponse("Username or email and password are required.", 400);
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

  let backendResponse: Response;
  try {
    backendResponse = await fetch(new URL("/api/v1/auth/login", apiBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
      cache: "no-store",
    });
  } catch {
    return errorResponse(
      "The sign-in service is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (backendResponse.status === 401) {
    return errorResponse("Invalid username/email or password.", 401);
  }

  if (backendResponse.status === 422) {
    return errorResponse(
      "Please enter your username or email and password.",
      422,
    );
  }

  if (backendResponse.status >= 500) {
    return errorResponse(
      "The sign-in service is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (!backendResponse.ok) {
    return errorResponse("Unable to sign in. Please try again.", 502);
  }

  let tokenResponse: unknown;
  try {
    tokenResponse = await backendResponse.json();
  } catch {
    return errorResponse(
      "The sign-in service returned an invalid response.",
      502,
    );
  }

  if (!isLoginTokenResponse(tokenResponse)) {
    return errorResponse(
      "The sign-in service returned an invalid response.",
      502,
    );
  }

  return Response.json(tokenResponse);
}
