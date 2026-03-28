type ApiErrorShape = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as ApiErrorShape).response?.data?.error;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return fallback;
}
