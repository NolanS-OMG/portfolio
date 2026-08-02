export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  tool_used: null;
}

export interface WelcomeResponse {
  message: string;
  suggestions: string[];
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
}

export interface SessionHistoryResponse {
  session_id: string;
  messages: Message[];
}

export interface ChatError {
  error: string;
  message: string;
  retry_after_seconds?: number;
}
