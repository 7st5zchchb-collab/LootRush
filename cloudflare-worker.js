const ORIGIN = "https://lootrush-2.onrender.com";
const ALLOWED_ORIGINS = new Set([
  "https://lootrush.com",
  "https://www.lootrush.com",
  "https://7st5zchchb-collab.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
    "Vary": "Origin"
  };
  if (ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function withHeaders(response, request, cacheControl) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) headers.set(key, value);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  if (cacheControl) headers.set("Cache-Control", cacheControl);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const target = new URL(url.pathname + url.search, ORIGIN);
    const init = {
      method: request.method,
      headers: request.headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual"
    };

    const response = await fetch(target, init);

    // Never cache authentication, account, progress, verification or payment endpoints.
    const noCachePaths = new Set([
      "/register", "/login", "/me", "/sync-progress", "/verify-email",
      "/resend-verification", "/create-checkout-session", "/stripe-webhook"
    ]);

    if (noCachePaths.has(url.pathname) || url.pathname === "/api/wins/stream") {
      return withHeaders(response, request, "no-store");
    }

    // Small cache windows are safe for non-personal informational endpoints.
    if (request.method === "GET" && url.pathname === "/health") {
      return withHeaders(response, request, "public, max-age=5, s-maxage=10, stale-if-error=30");
    }

    if (request.method === "GET" && url.pathname === "/api/online") {
      return withHeaders(response, request, "public, max-age=2, s-maxage=5, stale-if-error=10");
    }

    return withHeaders(response, request, "no-store");
  }
};
