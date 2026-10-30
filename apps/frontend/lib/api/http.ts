"use client";

import axios, { AxiosError } from "axios";
import { ApiError, type ApiErrorBody } from "./api-error";

/**
 * Axios instance for Client Components. Use it inside TanStack Query
 * (`useQuery` / `useMutation`), not in Server Components (they use `apiServer`).
 * Paths start after `/api`, e.g. `http.get("/v1/posts")`.
 */
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Every failed request rejects with ApiError, the same shape apiServer throws.
http.interceptors.response.use(undefined, (error: AxiosError<ApiErrorBody>) => {
  const body = error.response?.data?.error;
  return Promise.reject(
    new ApiError(
      error.response?.status ?? 0,
      body?.code ?? "NETWORK_ERROR",
      body?.message ?? error.message,
      body?.details,
    ),
  );
});
