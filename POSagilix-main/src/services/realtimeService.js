/**
 * Realtime SSE Client for Agilix Console Service
 * Connects to /api/v1/events and emits events to subscribers
 */
const listeners = new Set();
let eventSource = null;
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
  connect() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
      return;
    }

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const sseUrl = `${apiBaseUrl}/events?token=${encodeURIComponent(token)}`;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('[SSE] Connected to Agilix Realtime Events stream');
      };

      SUPPORTED_EVENTS.forEach((eventName) => {
        eventSource.addEventListener(eventName, (e) => {
          try {
            const parsed = JSON.parse(e.data);
            listeners.forEach((listener) => {
              try {
                listener({ event: eventName, ...parsed });
              } catch (err) {
                console.error('[SSE] Listener error:', err);
              }
            });
          } catch (err) {
            console.error('[SSE] Parse event error:', err);
          }
        });
      });

      eventSource.onerror = (err) => {
        console.warn('[SSE] Connection lost, reconnecting in 5s...', err);
        eventSource?.close();
        eventSource = null;
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (e) {
      console.error('[SSE] Failed to initialize EventSource:', e);
    }
  },

  disconnect() {
    clearTimeout(reconnectTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
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

