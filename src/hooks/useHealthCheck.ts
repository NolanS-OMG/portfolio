import { useState, useEffect, useRef } from 'react';
import { getHealth } from '../services/chatApi';
import type { HealthResponse } from '../types/chat';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

interface UseHealthCheckReturn {
  status: HealthStatus;
  isHealthy: boolean;
  lastCheck: string | null;
  failCount: number;
}

/**
 * Hook to monitor API health status
 * Polls the health endpoint at regular intervals
 */
export function useHealthCheck(intervalMs: number = 30000): UseHealthCheckReturn {
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  const intervalRef = useRef<number>();

  const checkHealth = async () => {
    try {
      const response: HealthResponse = await getHealth();
      setStatus(response.status);
      setLastCheck(response.timestamp);
      setFailCount(0); // Reset fail count on success
    } catch (error) {
      console.error('Health check failed:', error);
      setFailCount((prev) => prev + 1);

      // After 3 consecutive failures, mark as unhealthy
      if (failCount >= 2) {
        setStatus('unhealthy');
      }
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkHealth();

    // Then check at intervals
    intervalRef.current = window.setInterval(checkHealth, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, failCount]);

  return {
    status,
    isHealthy: status === 'healthy',
    lastCheck,
    failCount,
  };
}
