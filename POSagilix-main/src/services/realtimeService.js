/**
 * Realtime SSE Client for Agilix Console Service
 * Connects to /api/v1/events using fetch + Authorization header
 * (EventSource tidak support custom header, sehingga tidak digunakan)
 */
const listeners = new Set();
let abortController = null;
let reconnectTimeout = null;

const SUPPORTED_EVENTS = [
  'tenant.created',
  'tenant.updated',
  'tenant.locked',
  'tenant.unlocked',
  'invoice.generated',
  'invoice.overdue',
  'invoice.cancelled',
  'payment.received',
  'device.registered',
  'device.online',
  'device.offline',
  'notification.sent',
  'notification.failed',
];

export const realtimeService = {
  async connect() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (abortController) return;

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

    abortController = new AbortController();

    try {
      const response = await fetch(`${apiBaseUrl}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      console.log('[SSE] Connected to Agilix Realtime Events stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let eventType = 'message';
        let dataLine = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLine = line.slice(5).trim();
          } else if (line === '' && dataLine) {
            if (SUPPORTED_EVENTS.includes(eventType)) {
              try {
                const parsed = JSON.parse(dataLine);
                listeners.forEach((listener) => {
                  try {
                    listener({ event: eventType, ...parsed });
                  } catch (err) {
                    console.error('[SSE] Listener error:', err);
                  }
                });
              } catch (err) {
                console.error('[SSE] Parse error:', err);
              }
            }
            eventType = 'message';
            dataLine = '';
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[SSE] Connection lost, reconnecting in 5s...', err);
      abortController = null;
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => this.connect(), 5000);
    }
  },

  disconnect() {
    clearTimeout(reconnectTimeout);
    if (abortController) {
      abortController.abort();
      abortController = null;
      console.log('[SSE] Disconnected from stream');
    }
  },

  subscribe(listener) {
    listeners.add(listener);
    this.connect();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.disconnect();
      }
    };
  },
};
