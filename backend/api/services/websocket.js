const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections by userId
    this.dropSubscriptions = new Map(); // Map to store drop subscriptions by dropId
    
    this.init();
  }

  init() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Extract token from query string
        const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
        if (!token) {
          ws.close(1008, 'Authentication required');
          return;
        }

        // Verify token and get userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Store client connection
        this.clients.set(userId, ws);

        // Handle messages
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleMessage(userId, data);
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          this.handleDisconnect(userId);
        });

        // Send initial connection success message
        ws.send(JSON.stringify({ type: 'connected', userId }));
      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  handleMessage(userId, data) {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscribe(userId, data.dropId);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(userId, data.dropId);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  handleSubscribe(userId, dropId) {
    if (!this.dropSubscriptions.has(dropId)) {
      this.dropSubscriptions.set(dropId, new Set());
    }
    this.dropSubscriptions.get(dropId).add(userId);
  }

  handleUnsubscribe(userId, dropId) {
    const subscribers = this.dropSubscriptions.get(dropId);
    if (subscribers) {
      subscribers.delete(userId);
    }
  }

  handleDisconnect(userId) {
    // Remove client connection
    this.clients.delete(userId);

    // Remove user from all drop subscriptions
    this.dropSubscriptions.forEach((subscribers, dropId) => {
      subscribers.delete(userId);
    });
  }

  // Broadcast updates to subscribed clients
  broadcastToDrop(dropId, data) {
    const subscribers = this.dropSubscriptions.get(dropId);
    if (!subscribers) return;

    const message = JSON.stringify(data);
    subscribers.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send message to specific user
  sendToUser(userId, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

module.exports = WebSocketService; 