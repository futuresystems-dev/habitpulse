export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiError(
  statusCode: number,
  code: string,
  message: string
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status: statusCode }
  );
}

export function apiSuccess<T>(data: T, status: number = 200): Response {
  return Response.json({ data }, { status });
}

// Common error helpers
export const errorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  INVALID_INPUT: "INVALID_INPUT",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  FREE_TIER_LIMIT: "FREE_TIER_LIMIT",
} as const;
