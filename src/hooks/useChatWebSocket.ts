import { useRef, useState, useCallback, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || '';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface ToolCallData {
  tool: string;
  args: Record<string, unknown>;
}

interface StreamCallbacks {
  onChunk: (fullContent: string) => void;
  onDone: (fullContent: string) => void;
  onError: (message: string, retryAfter?: number) => void;
  onToolCall?: (data: ToolCallData) => void;
}

interface UseChatWebSocketReturn {
  status: ConnectionStatus;
  sendMessage: (message: string, language: 'en' | 'es', callbacks: StreamCallbacks) => void;
}

const SESSION_STORAGE_KEY = 'chat_session_id';

export function useChatWebSocket(): UseChatWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const sessionIdRef = useRef<string | null>(
    sessionStorage.getItem(SESSION_STORAGE_KEY)
  );
  const callbacksRef = useRef<StreamCallbacks | null>(null);
  const contentRef = useRef('');
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    const url = new URL(API_URL || window.location.origin);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${url.host}/ws/chat?api_key=${API_KEY}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setStatus('connected');
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          sessionIdRef.current = data.session_id;
          sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_id);
          break;

        case 'content':
          contentRef.current += data.content;
          callbacksRef.current?.onChunk(contentRef.current);
          break;

        case 'tool_call':
          if (callbacksRef.current?.onToolCall) {
            callbacksRef.current.onToolCall({
              tool: data.tool || data.function?.name || '',
              args: data.args || data.function?.arguments || {},
            });
          }
          break;
        case 'tool_result':
          break;

        case 'done':
          callbacksRef.current?.onDone(contentRef.current);
          callbacksRef.current = null;
          break;

        case 'error':
          callbacksRef.current?.onError(data.message, data.retry_after_seconds);
          callbacksRef.current = null;
          break;
      }
    };

    ws.onerror = () => {
      setStatus('disconnected');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;

      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 16000);
        reconnectAttemptRef.current++;
        reconnectTimeoutRef.current = window.setTimeout(connect, delay);
      }
    };

    wsRef.current = ws;
  }, []);

  const sendMessage = useCallback((message: string, language: 'en' | 'es', callbacks: StreamCallbacks) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      callbacks.onError('Not connected');
      return;
    }

    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 4096) return;

    contentRef.current = '';
    callbacksRef.current = callbacks;

    const payload: Record<string, string> = { message: trimmed, language };
    if (sessionIdRef.current) {
      payload.session_id = sessionIdRef.current;
    }

    wsRef.current.send(JSON.stringify(payload));
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { status, sendMessage };
}
