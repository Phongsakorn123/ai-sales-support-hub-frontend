type Context = { params: Promise<{ filename: string }> };

const SAFE_FILENAME =
  /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.(?:jpe?g|png|webp|gif)$/i;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function GET(
  _request: Request,
  context: Context,
): Promise<Response> {
  const { filename } = await context.params;
  if (!SAFE_FILENAME.test(filename)) {
    return Response.json({ detail: "Invalid product image." }, { status: 400 });
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api/v1";

  let upstream: Response;
  try {
    const backendOrigin = new URL(apiBaseUrl).origin;
    const imageUrl = new URL(
      `/static/products/${encodeURIComponent(filename)}`,
      backendOrigin,
    );
    upstream = await fetch(imageUrl, { cache: "no-store" });
  } catch {
    return Response.json(
      { detail: "The product image service is unavailable." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  const contentType = upstream.headers
    .get("Content-Type")
    ?.split(";", 1)[0]
    .toLowerCase();
  if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return new Response(null, { status: 415 });
  }

  return new Response(upstream.body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
