/**
 * Custom error classes for better error handling
 */
export class InviteError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "InviteError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Error codes for different invite-related errors
 */
export const INVITE_ERROR_CODES = {
  INVALID_CODE: "INVALID_CODE",
  EXPIRED: "EXPIRED",
  ALREADY_USED: "ALREADY_USED",
  ALREADY_MEMBER: "ALREADY_MEMBER",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  FAMILY_NOT_FOUND: "FAMILY_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Get user-friendly error messages
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof InviteError) {
    switch (error.code) {
      case INVITE_ERROR_CODES.INVALID_CODE:
        return "The invite code is invalid or does not exist.";
      case INVITE_ERROR_CODES.EXPIRED:
        return "This invite has expired. Please request a new one.";
      case INVITE_ERROR_CODES.ALREADY_USED:
        return "This invite has already been used.";
      case INVITE_ERROR_CODES.ALREADY_MEMBER:
        return "You are already a member of this family.";
      case INVITE_ERROR_CODES.PERMISSION_DENIED:
        return "You do not have permission to perform this action.";
      case INVITE_ERROR_CODES.FAMILY_NOT_FOUND:
        return "The family associated with this invite could not be found.";
      case INVITE_ERROR_CODES.USER_NOT_FOUND:
        return "User not found. Please sign in and try again.";
      case INVITE_ERROR_CODES.NETWORK_ERROR:
        return "Network error. Please check your connection and try again.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof PermissionError) {
    return error.message;
  }

  // Handle Firebase errors
  if (error.code) {
    switch (error.code) {
      case "permission-denied":
        return "You do not have permission to perform this action.";
      case "not-found":
        return "The requested resource was not found.";
      case "already-exists":
        return "This resource already exists.";
      case "unavailable":
        return "Service is temporarily unavailable. Please try again later.";
      case "unauthenticated":
        return "You must be signed in to perform this action.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  return error.message || "An unexpected error occurred.";
};

/**
 * Log error with context
 */
export const logError = (error: any, context: string) => {
  console.error(`[${context}]`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
