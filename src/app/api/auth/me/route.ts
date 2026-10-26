function errorResponse(message: string, status: number): Response {
  return Response.json({ detail: message }, { status });
}

export async function GET(request: Request): Promise<Response> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Sign in is required.", 401);
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

  let backendResponse: Response;
  try {
    backendResponse = await fetch(new URL("/api/v1/auth/me", apiBaseUrl), {
      method: "GET",
      headers: { Authorization: authorization },
      cache: "no-store",
    });
  } catch {
    return errorResponse(
      "The authentication service is temporarily unavailable. Please try again.",
      503,
    );
  }

  if (backendResponse.status === 401) {
    return errorResponse("Your session is invalid or has expired.", 401);
  }

  if (backendResponse.status === 403) {
    return errorResponse("Your account cannot access this page.", 403);
  }

  if (backendResponse.status >= 500) {
    return errorResponse(
      "The authentication service is temporarily unavailable. Please try again.",
      503,
    );
  }

  if (!backendResponse.ok) {
    return errorResponse("Unable to verify your session.", 502);
  }

  return new Response(null, { status: 204 });
}
