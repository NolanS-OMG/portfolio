import type {
  ChatResponse,
  WelcomeResponse,
  HealthResponse,
  SessionHistoryResponse,
  ChatError,
} from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error('VITE_API_KEY is not set in environment variables');
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY || '',
};

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Generic fetch wrapper with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {},
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;
  const { skipAuth, ...requestOptions } = options;

  console.log(`[chatApi] Fetching ${url}`, {
    method: requestOptions.method || 'GET',
    maxRetries,
    hasBody: !!requestOptions.body
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const baseHeaders = skipAuth
        ? { 'Content-Type': 'application/json' }
        : DEFAULT_HEADERS;

      const fetchOptions = {
        ...requestOptions,
        headers: {
          ...baseHeaders,
          ...requestOptions.headers,
        },
      };

      console.log(`[chatApi] Attempt ${attempt}/${maxRetries}`, {
        url,
        method: fetchOptions.method,
        headers: { ...fetchOptions.headers, 'X-API-Key': '***' }, // Hide API key in logs
        body: requestOptions.body ? JSON.parse(requestOptions.body as string) : undefined
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
 * Note: /health endpoint does NOT require X-API-Key
 */
export async function getHealth(): Promise<HealthResponse> {
  return fetchWithRetry<HealthResponse>(`${API_BASE_URL}/api/v1/health`, {
    method: 'GET',
    skipAuth: true,
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
 *
 * IMPORTANT per API spec:
 * - session_id must be OMITTED or null if not available (never empty string "")
 * - message must be 1-4096 chars
 * - language must be "en" or "es"
 */
export async function sendMessage(
  message: string,
  sessionId?: string | null,
  language: 'en' | 'es' = 'en'
): Promise<ChatResponse> {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length === 0) {
    throw Object.assign(new Error('Message cannot be empty'), { code: 'validation_error' });
  }
  if (trimmed.length > 4096) {
    throw Object.assign(new Error('Message too long (max 4096 characters)'), { code: 'validation_error' });
  }

  const validLangs = ['en', 'es'] as const;
  const lang = validLangs.includes(language) ? language : 'en';

  const payload: Record<string, string> = { message: trimmed, language: lang };

  // Only include session_id if it's a non-empty string
  if (sessionId && sessionId.trim().length > 0) {
    payload.session_id = sessionId.trim();
  }

  return fetchWithRetry<ChatResponse>(
    `${API_BASE_URL}/api/v1/chat`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    1
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
