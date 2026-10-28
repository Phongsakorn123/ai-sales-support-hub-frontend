import { errorResponse, forwardProductRead } from "../../_forward";

type Context = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: Context,
): Promise<Response> {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return errorResponse("Invalid product id.", 400);
  return forwardProductRead(
    request,
    `/api/v1/products/${id}/documents?limit=100`,
  );
}
