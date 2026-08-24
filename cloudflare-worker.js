const ORIGIN = "https://lootrush-2.onrender.com";

const ALLOWED_ORIGINS = new Set([
  "https://lootrush.com",
  "https://www.lootrush.com",
  "https://lootrush.7st5zchchb.workers.dev",
  "https://7st5zchchb-collab.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
  if (ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function withHeaders(response, request, cacheControl = "no-store") {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) headers.set(key, value);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Cache-Control", cacheControl);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // Never let the Worker accidentally serve the frontend itself for API routes.
    // Every application request is proxied to the Render backend.
    const target = new URL(url.pathname + url.search, ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete("host");

    try {
      const response = await fetch(target, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual"
      });

      return withHeaders(response, request, "no-store");
    } catch (error) {
      return new Response(JSON.stringify({ error: "Backend unavailable" }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
          "Cache-Control": "no-store"
        }
      });
    }
  }
};
