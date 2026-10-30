/** Mirrors the backend's error body: `{ error: { statusCode, code, message, details? } }`. */
export interface ApiErrorBody {
  error: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Thrown by apiServer and the `http` Axios instance for any failed request. Branch on `code`, not `message`. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    return new ApiError(
      res.status,
      body?.error.code ?? "UNKNOWN",
      body?.error.message ?? res.statusText,
      body?.error.details,
    );
  }
}

export async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await ApiError.fromResponse(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}
