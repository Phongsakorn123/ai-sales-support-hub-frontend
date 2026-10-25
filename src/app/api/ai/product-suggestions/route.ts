import { forwardProductRequest } from "../../products/_forward";

export async function POST(request: Request): Promise<Response> {
  return forwardProductRequest(
    request,
    "/api/v1/ai/product-suggestions",
    "POST",
  );
}
