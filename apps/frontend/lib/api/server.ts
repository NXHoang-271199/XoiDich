import "server-only";
import { cookies } from "next/headers";
import { serverApiUrl } from "../env";
import { parseResponse } from "./api-error";

/**
 * Calls the backend from Server Components, Server Functions, and Route Handlers.
 * Forwards the browser's cookies, so the backend sees the same session as the browser.
 * `path` starts after `/api`, e.g. `/v1/users/me`.
 */
export async function apiServer<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("cookie", (await cookies()).toString());
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");

  const res = await fetch(`${serverApiUrl}${path}`, { ...init, headers, cache: "no-store" });
  return parseResponse<T>(res);
}
