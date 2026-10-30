import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated on first use. Never import this from a
 * Client Component: `server-only` turns that into a build error.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  // Inside Docker the browser reaches the API on localhost, but the Next.js server
  // must use the service name. Falls back to the public URL outside Docker.
  API_INTERNAL_URL: z.url().optional(),
});

export const serverEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
});

export const serverApiUrl = serverEnv.API_INTERNAL_URL ?? serverEnv.NEXT_PUBLIC_API_URL;
