import { useState, useEffect } from 'react';

const SESSION_KEY = 'portfolio_chat_session';

interface UseChatSessionReturn {
  sessionId: string | null;
  saveSession: (id: string) => void;
  clearSession: () => void;
}

/**
 * Hook to manage chat session ID in localStorage
 */
export function useChatSession(): UseChatSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored && stored.trim().length > 0 ? stored.trim() : null;
    } catch (error) {
      console.error('Failed to read session from localStorage:', error);
      return null;
    }
  });

  const saveSession = (id: string) => {
    if (!id || id.trim().length === 0) return;
    try {
      localStorage.setItem(SESSION_KEY, id.trim());
      setSessionId(id.trim());
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setSessionId(null);
    } catch (error) {
      console.error('Failed to clear session from localStorage:', error);
    }
  };

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setSessionId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { sessionId, saveSession, clearSession };
}
