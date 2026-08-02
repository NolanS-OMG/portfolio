import type {
  ChatResponse,
  WelcomeResponse,
  HealthResponse,
  SessionHistoryResponse,
  ChatError,
} from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error('VITE_API_KEY is not set in environment variables');
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY || '',
};

/**
 * Generic fetch wrapper with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  console.log(`[chatApi] Fetching ${url}`, {
    method: options.method || 'GET',
    maxRetries,
    hasBody: !!options.body
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fetchOptions = {
        ...options,
        headers: {
          ...DEFAULT_HEADERS,
          ...options.headers,
        },
        credentials: 'include' as RequestCredentials, // Important for cookies
      };

      console.log(`[chatApi] Attempt ${attempt}/${maxRetries}`, {
        url,
        method: fetchOptions.method,
        headers: { ...fetchOptions.headers, 'X-API-Key': '***' }, // Hide API key in logs
        body: options.body ? JSON.parse(options.body as string) : undefined
      });

      const response = await fetch(url, fetchOptions);
      console.log(`[chatApi] Response received`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // If response is not ok, try to parse error
      if (!response.ok) {
        const errorData: ChatError = await response.json().catch(() => ({
          error: 'unknown_error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));

        console.error('[chatApi] Error response:', errorData);

        const error = new Error(errorData.message || 'Request failed');
        (error as any).code = errorData.error;
        (error as any).statusCode = response.status;
        (error as any).retryAfter = errorData.retry_after_seconds;
        throw error;
      }

      const data = await response.json();
      console.log('[chatApi] Success response:', data);
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(`[chatApi] Attempt ${attempt} failed:`, error);

      // Don't retry on 4xx errors (client errors)
      if ((error as any).statusCode && (error as any).statusCode < 500) {
        console.log('[chatApi] Client error, not retrying');
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        console.log('[chatApi] Max retries reached, throwing error');
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`[chatApi] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check health status of the API
 */
export async function getHealth(): Promise<HealthResponse> {
  return fetchWithRetry<HealthResponse>(`${API_BASE_URL}/api/v1/health`, {
    method: 'GET',
  });
}

/**
 * Get welcome message and suggestions
 */
export async function getWelcome(): Promise<WelcomeResponse> {
  return fetchWithRetry<WelcomeResponse>(`${API_BASE_URL}/api/v1/chat/welcome`, {
    method: 'GET',
  });
}

/**
 * Send a message to the chat API
 */
export async function sendMessage(
  message: string,
  sessionId?: string,
  language: 'en' | 'es' = 'en'
): Promise<ChatResponse> {
  return fetchWithRetry<ChatResponse>(
    `${API_BASE_URL}/api/v1/chat`,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        language,
      }),
    },
    1 // Only 1 attempt for chat messages (user can retry manually)
  );
}

/**
 * Get session history
 */
export async function getSessionHistory(sessionId: string): Promise<SessionHistoryResponse> {
  return fetchWithRetry<SessionHistoryResponse>(
    `${API_BASE_URL}/api/v1/chat/session/${sessionId}/history`,
    {
      method: 'GET',
    }
  );
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await fetchWithRetry<void>(
    `${API_BASE_URL}/api/v1/chat/session/${sessionId}`,
    {
      method: 'DELETE',
    }
  );
}
