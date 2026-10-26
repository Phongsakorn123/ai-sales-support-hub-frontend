import { errorResponse, forwardProductRequest } from "./_forward";

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export async function GET(request: Request): Promise<Response> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Sign in is required.", 401);
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";
  const products: unknown[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = new URL("/api/v1/products", apiBaseUrl);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(page * PAGE_SIZE));

    let backendResponse: Response;
    try {
      backendResponse = await fetch(url, {
        method: "GET",
        headers: { Authorization: authorization },
        cache: "no-store",
      });
    } catch {
      return errorResponse(
        "The product service is temporarily unavailable. Please try again.",
        503,
      );
    }

    if (backendResponse.status === 401) {
      return errorResponse("Your session is invalid or has expired.", 401);
    }
    if (backendResponse.status === 403) {
      return errorResponse("Your account cannot access products.", 403);
    }
    if (!backendResponse.ok) {
      return errorResponse("Unable to load products.", 502);
    }

    let pageItems: unknown;
    try {
      pageItems = await backendResponse.json();
    } catch {
      return errorResponse(
        "The product service returned an invalid response.",
        502,
      );
    }
    if (!Array.isArray(pageItems)) {
      return errorResponse(
        "The product service returned an invalid response.",
        502,
      );
    }

    products.push(...pageItems);
    if (pageItems.length < PAGE_SIZE) break;
  }

  return Response.json(products);
}

export async function POST(request: Request): Promise<Response> {
  return forwardProductRequest(request, "/api/v1/products", "POST");
}
