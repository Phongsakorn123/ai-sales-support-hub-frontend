const PRODUCT_IMAGE_PATH =
  /^\/static\/products\/([A-Za-z0-9][A-Za-z0-9._-]{0,127}\.(?:jpe?g|png|webp|gif))$/i;

const configuredBackendHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8002/api/v1",
    ).hostname;
  } catch {
    return "";
  }
})();

const backendHosts = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "backend",
  configuredBackendHost,
]);

export function productImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const source = value.trim();
  if (!source) return "";

  let pathname: string;
  if (source.startsWith("/")) {
    pathname = source.split(/[?#]/, 1)[0];
  } else {
    try {
      const url = new URL(source);
      if (!backendHosts.has(url.hostname)) return source;
      pathname = url.pathname;
    } catch {
      return source;
    }
  }

  const match = pathname.match(PRODUCT_IMAGE_PATH);
  return match ? `/api/product-images/${encodeURIComponent(match[1])}` : source;
}
