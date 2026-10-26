export function errorResponse(message: string, status: number): Response {
  return Response.json({ detail: message }, { status });
}

export async function forwardProductRequest(
  request: Request,
  path: string,
  method: "POST" | "PATCH" | "DELETE",
): Promise<Response> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Sign in is required.", 401);
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";
  const headers: Record<string, string> = { Authorization: authorization };
  let body: string | undefined;
  if (method !== "DELETE") {
    body = await request.text();
    headers["Content-Type"] = "application/json";
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(new URL(path, apiBaseUrl), {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return errorResponse(
      "The product service is temporarily unavailable. Please try again.",
      503,
    );
  }

  if (backendResponse.status === 204) {
    return new Response(null, { status: 204 });
  }
  return new Response(await backendResponse.text(), {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get("Content-Type") ?? "application/json",
    },
  });
}
