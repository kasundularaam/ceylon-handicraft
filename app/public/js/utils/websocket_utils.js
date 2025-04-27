/**
 * WebSocket utility functions for real-time connections for Ceylon Handicrafts
 * Primarily used for auction bidding functionality
 */

// Store active connections
const activeConnections = new Map();

/**
 * Create and manage a WebSocket connection
 * @param {string} endpoint - The WebSocket endpoint to connect to
 * @param {object} options - Configuration options
 * @param {function} options.onMessage - Handler for incoming messages
 * @param {function} options.onOpen - Handler for connection open event
 * @param {function} options.onClose - Handler for connection close event
 * @param {function} options.onError - Handler for connection errors
 * @param {boolean} options.reconnect - Whether to automatically reconnect
 * @param {number} options.reconnectDelay - Delay between reconnection attempts (ms)
 * @returns {object} - Connection controller with send and close methods
 */
export function createWebSocketConnection(endpoint, options = {}) {
  const {
    onMessage = () => {},
    onOpen = () => {},
    onClose = () => {},
    onError = () => {},
    reconnect = true,
    reconnectDelay = 3000,
  } = options;

  // Close existing connection to the same endpoint if it exists
  if (activeConnections.has(endpoint)) {
    activeConnections.get(endpoint).close();
  }

  // Determine WebSocket URL (relative or absolute)
  const wsUrl = endpoint.startsWith("ws")
    ? endpoint
    : `${location.protocol === "https:" ? "wss:" : "ws:"}//${
        location.host
      }${endpoint}`;

  // Create WebSocket
  let ws = new WebSocket(wsUrl);
  let reconnectAttempts = 0;
  let reconnectTimeout;

  // WebSocket event handlers
  ws.onopen = (event) => {
    reconnectAttempts = 0;
    onOpen(event);
  };

  ws.onmessage = (event) => {
    // Try to parse JSON, fallback to raw data if parsing fails
    try {
      const data = JSON.parse(event.data);
      onMessage(data, event);
    } catch (e) {
      onMessage(event.data, event);
    }
  };

  ws.onclose = (event) => {
    onClose(event);

    // Remove from active connections
    activeConnections.delete(endpoint);

    // Attempt to reconnect if enabled
    if (reconnect && !event.wasClean) {
      const delay = reconnectDelay * Math.min(reconnectAttempts, 5);
      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        createWebSocketConnection(endpoint, options);
      }, delay);
    }
  };

  ws.onerror = (error) => {
    onError(error);
  };

  // Create connection controller
  const controller = {
    // Send data through WebSocket (automatically stringifies objects)
    send: (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (typeof data === "object") {
          ws.send(JSON.stringify(data));
        } else {
          ws.send(data);
        }
        return true;
      }
      return false;
    },

    // Close the connection
    close: () => {
      clearTimeout(reconnectTimeout);
      ws.close();
      activeConnections.delete(endpoint);
    },

    // Get connection state
    getState: () => {
      return ws.readyState;
    },
  };

  // Store in active connections
  activeConnections.set(endpoint, controller);

  return controller;
}

/**
 * Create a product auction WebSocket connection
 * @param {string} productId - The product ID to connect to
 * @param {object} options - Configuration options
 * @returns {object} - Connection controller
 */
export function createProductAuctionConnection(productId, options = {}) {
  return createWebSocketConnection(`/ws/auction/${productId}`, options);
}

/**
 * Close all active WebSocket connections
 */
export function closeAllConnections() {
  activeConnections.forEach((connection) => connection.close());
  activeConnections.clear();
}
