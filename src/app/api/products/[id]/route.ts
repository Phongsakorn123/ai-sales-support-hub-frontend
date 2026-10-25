import { errorResponse, forwardProductRequest } from "../_forward";

type Context = { params: Promise<{ id: string }> };

async function productPath(context: Context): Promise<string | null> {
  const { id } = await context.params;
  return /^\d+$/.test(id) ? `/api/v1/products/${id}` : null;
}

export async function PATCH(
  request: Request,
  context: Context,
): Promise<Response> {
  const path = await productPath(context);
  if (!path) return errorResponse("Invalid product id.", 400);
  return forwardProductRequest(request, path, "PATCH");
}

export async function DELETE(
  request: Request,
  context: Context,
): Promise<Response> {
  const path = await productPath(context);
  if (!path) return errorResponse("Invalid product id.", 400);
  return forwardProductRequest(request, path, "DELETE");
}
