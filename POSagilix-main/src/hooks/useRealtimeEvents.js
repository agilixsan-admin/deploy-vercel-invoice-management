import { useEffect } from 'react';
import { realtimeService } from '../services/realtimeService';

/**
 * Custom hook to listen to realtime SSE events from Agilix Console Service
 * @param {Function} onEvent - Callback called with { event, eventId, version, timestamp, data }
 */
export function useRealtimeEvents(onEvent) {
  useEffect(() => {
    if (typeof onEvent !== 'function') return;

    const unsubscribe = realtimeService.subscribe(onEvent);
    return () => {
      unsubscribe();
    };
  }, [onEvent]);
}

