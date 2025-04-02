import { Drop, DropQueue, CartReservation } from '../types/drop';

type WebSocketMessage = {
  type: string;
  data?: any;
  dropId?: string;
};

type WebSocketEventHandlers = {
  onDropUpdate?: (drop: Drop) => void;
  onQueueUpdate?: (queue: DropQueue) => void;
  onCartReservation?: (reservation: CartReservation) => void;
  onConnected?: (userId: string) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private subscriptions = new Set<string>();
  private eventHandlers: WebSocketEventHandlers = {};
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue = false;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly HEARTBEAT_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly QUEUE_PROCESSING_INTERVAL = 100; // 100ms

  constructor(private token: string) {}

  connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;

    this.isConnecting = true;
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  private handleOpen() {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    // Start heartbeat
    this.startHeartbeat();

    // Process message queue
    this.processMessageQueue();

    // Resubscribe to all drops
    this.subscriptions.forEach(dropId => {
      this.subscribe(dropId);
    });

    if (this.eventHandlers.onConnected) {
      this.eventHandlers.onConnected(this.getUserId());
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  private sendHeartbeat() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.sendMessage({ type: 'heartbeat' });

    // Set timeout for heartbeat response
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }

    this.heartbeatTimeout = setTimeout(() => {
      this.handleHeartbeatTimeout();
    }, this.HEARTBEAT_TIMEOUT);
  }

  private handleHeartbeatTimeout() {
    console.warn('Heartbeat timeout, reconnecting...');
    this.disconnect();
    this.connect();
  }

  private handleClose() {
    this.isConnecting = false;
    this.stopHeartbeat();
    this.stopQueueProcessing();

    if (this.eventHandlers.onDisconnected) {
      this.eventHandlers.onDisconnected();
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
        this.connect();
      }, this.reconnectDelay);
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private handleError(error: Event) {
    this.isConnecting = false;
    this.stopHeartbeat();
    if (this.eventHandlers.onError) {
      this.eventHandlers.onError(new Error('WebSocket connection error'));
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === 'heartbeat:response') {
        if (this.heartbeatTimeout) {
          clearTimeout(this.heartbeatTimeout);
        }
        return;
      }

      this.handleWebSocketMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'drop:updated':
        if (this.eventHandlers.onDropUpdate) {
          this.eventHandlers.onDropUpdate(message.data);
        }
        break;
      case 'queue:updated':
        if (this.eventHandlers.onQueueUpdate) {
          this.eventHandlers.onQueueUpdate(message.data);
        }
        break;
      case 'cart:reserved':
        if (this.eventHandlers.onCartReservation) {
          this.eventHandlers.onCartReservation(message.data);
        }
        break;
      case 'connected':
        console.log('Connected to WebSocket server');
        break;
      case 'error':
        if (this.eventHandlers.onError) {
          this.eventHandlers.onError(new Error(message.data.message));
        }
        break;
    }
  }

  private processMessageQueue() {
    if (this.isProcessingQueue || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.isProcessingQueue = true;
    const processInterval = setInterval(() => {
      if (this.messageQueue.length === 0) {
        clearInterval(processInterval);
        this.isProcessingQueue = false;
        return;
      }

      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }, this.QUEUE_PROCESSING_INTERVAL);
  }

  private stopQueueProcessing() {
    this.isProcessingQueue = false;
  }

  subscribe(dropId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queueMessage({
        type: 'subscribe',
        dropId
      });
      return;
    }

    this.subscriptions.add(dropId);
    this.sendMessage({
      type: 'subscribe',
      dropId
    });
  }

  unsubscribe(dropId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queueMessage({
        type: 'unsubscribe',
        dropId
      });
      return;
    }

    this.subscriptions.delete(dropId);
    this.sendMessage({
      type: 'unsubscribe',
      dropId
    });
  }

  private queueMessage(message: WebSocketMessage) {
    if (this.messageQueue.length >= this.MAX_QUEUE_SIZE) {
      console.warn('Message queue full, dropping oldest message');
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);
  }

  private sendMessage(message: WebSocketMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queueMessage(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.queueMessage(message);
    }
  }

  setEventHandlers(handlers: WebSocketEventHandlers) {
    this.eventHandlers = handlers;
  }

  disconnect() {
    this.stopHeartbeat();
    this.stopQueueProcessing();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.messageQueue = [];
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  private getUserId(): string {
    const payload = JSON.parse(atob(this.token.split('.')[1]));
    return payload.id;
  }
}

export default WebSocketService; 