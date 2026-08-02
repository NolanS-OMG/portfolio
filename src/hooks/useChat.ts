import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatSession } from './useChatSession';
import {
  sendMessage as apiSendMessage,
  getWelcome,
  getSessionHistory,
  deleteSession,
} from '../services/chatApi';
import type { Message } from '../types/chat';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  loadWelcome: () => Promise<void>;
  loadHistory: () => Promise<void>;
  clearChat: () => Promise<void>;
  suggestions: string[];
}

/**
 * Main chat hook that orchestrates messaging, history, and session management
 */
export function useChat(): UseChatReturn {
  const { i18n } = useTranslation();
  const { sessionId, saveSession, clearSession } = useChatSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load welcome message and suggestions
   */
  const loadWelcome = useCallback(async () => {
    console.log('[useChat] Loading welcome message...');
    try {
      const welcomeData = await getWelcome();
      console.log('[useChat] Welcome data received:', welcomeData);

      // Add welcome message to chat
      setMessages([
        {
          role: 'assistant',
          content: welcomeData.message,
          timestamp: new Date().toISOString(),
        },
      ]);

      setSuggestions(welcomeData.suggestions);
      console.log('[useChat] Welcome message set, suggestions:', welcomeData.suggestions);
    } catch (err) {
      console.error('[useChat] Failed to load welcome message:', err);
      // Not critical, continue without welcome message
    }
  }, []);

  /**
   * Load session history if available
   */
  const loadHistory = useCallback(async () => {
    if (!sessionId) {
      console.log('[useChat] No session ID, skipping history load');
      return;
    }

    console.log('[useChat] Loading history for session:', sessionId);
    try {
      const historyData = await getSessionHistory(sessionId);
      console.log('[useChat] History data received:', historyData);

      if (historyData.messages && historyData.messages.length > 0) {
        setMessages(historyData.messages);
        console.log('[useChat] History loaded, message count:', historyData.messages.length);
      } else {
        console.log('[useChat] No messages in history');
      }
    } catch (err) {
      console.error('[useChat] Failed to load history:', err);
      // If history fails, clear the session and start fresh
      clearSession();
    }
  }, [sessionId, clearSession]);

  /**
   * Send a message to the chat API
   */
  const sendMessage = useCallback(
    async (text: string) => {
      console.log('[useChat] sendMessage called with:', text);

      if (!text.trim()) {
        console.log('[useChat] Empty message, ignoring');
        return;
      }

      if (isLoading) {
        console.log('[useChat] Already loading, ignoring');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message immediately for better UX
      const userMessage: Message = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      console.log('[useChat] Adding user message to UI:', userMessage);
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        console.log('[useChat] New messages state:', newMessages);
        return newMessages;
      });

      try {
        const language = i18n.language.startsWith('es') ? 'es' : 'en';
        console.log('[useChat] Sending to API - Language:', language, 'Session:', sessionId);

        const response = await apiSendMessage(text, sessionId || undefined, language);
        console.log('[useChat] API response received:', response);

        // Save session ID if this is the first message
        if (!sessionId && response.session_id) {
          console.log('[useChat] Saving new session ID:', response.session_id);
          saveSession(response.session_id);
        }

        // Add assistant response
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        console.log('[useChat] Adding assistant message to UI:', assistantMessage);
        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];
          console.log('[useChat] New messages state with assistant:', newMessages);
          return newMessages;
        });
      } catch (err: any) {
        console.error('[useChat] Failed to send message:', err);
        console.error('[useChat] Error details:', {
          code: err.code,
          statusCode: err.statusCode,
          message: err.message,
          retryAfter: err.retryAfter
        });

        // Handle specific error cases
        if (err.code === 'rate_limit_exceeded') {
          const retryAfter = err.retryAfter || 30;
          setError(`Too many requests. Please wait ${retryAfter} seconds.`);
        } else if (err.statusCode === 503) {
          setError('Chat service is temporarily unavailable. Please try again later.');
        } else {
          setError(err.message || 'Failed to send message. Please try again.');
        }

        // Remove the optimistic user message on error
        console.log('[useChat] Removing optimistic user message due to error');
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        console.log('[useChat] Setting isLoading to false');
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, i18n.language, saveSession]
  );

  /**
   * Clear chat history and session
   */
  const clearChat = useCallback(async () => {
    try {
      if (sessionId) {
        await deleteSession(sessionId);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      clearSession();
      setMessages([]);
      setSuggestions([]);
      setError(null);
      // Reload welcome message
      loadWelcome();
    }
  }, [sessionId, clearSession, loadWelcome]);

  // Load welcome or history on mount
  useEffect(() => {
    console.log('[useChat] Mount effect - Session ID:', sessionId);
    if (sessionId) {
      loadHistory();
    } else {
      loadWelcome();
    }
  }, []); // Only run once on mount

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadWelcome,
    loadHistory,
    clearChat,
    suggestions,
  };
}
