import { connection } from "next/server";

/**
 * Liveness/readiness probe for Docker, Nginx and uptime monitors.
 * Always rendered at request time and never cached.
 */
export async function GET() {
  await connection();
  return Response.json(
    {
      status: "ok",
      service: "kasra-frontend",
      version: process.env.APP_VERSION ?? "dev",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
