// websocket/server.js
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const dotenv = require('dotenv');

// Wczytanie zmiennych środowiskowych
dotenv.config();

// Stworzenie serwera HTTP
const server = http.createServer();

// Konfiguracja Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Połączenie z Redis dla synchronizacji pomiędzy instancjami WebSocket
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

// Obsługa błędów Redis
pubClient.on('error', (err) => console.error('Redis Pub Error', err));
subClient.on('error', (err) => console.error('Redis Sub Error', err));

// Połączenie z Redis
async function connectRedis() {
  await pubClient.connect();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Redis adapter connected');
}

connectRedis().catch(console.error);

// Referencja do klienta Redis dla operacji na kanałach
let redisClient;

async function setupRedisClient() {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
}

setupRedisClient().catch(console.error);

// Subskrypcja zmian w produkcie z Redis
async function subscribeToProductUpdates() {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  
  await subscriber.subscribe('product-updates', (message) => {
    try {
      const update = JSON.parse(message);
      // Emituj aktualizację do wszystkich klientów w odpowiednim pokoju dropu
      io.to(`drop:${update.dropId}`).emit('product-update', {
        productId: update.productId,
        available: update.available,
        reserved: update.reserved,
        sold: update.sold
      });
    } catch (error) {
      console.error('Error processing product update:', error);
    }
  });
  
  console.log('Subscribed to product-updates channel');
}

subscribeToProductUpdates().catch(console.error);

// Obsługa połączeń klientów
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Dołączanie do pokoju dropu
  socket.on('join-drop', async (dropId) => {
    // Opuść wszystkie inne pokoje dropów
    for (const room of socket.rooms) {
      if (room !== socket.id && room.startsWith('drop:')) {
        socket.leave(room);
      }
    }
    
    // Dołącz do pokoju dropu
    socket.join(`drop:${dropId}`);
    console.log(`Client ${socket.id} joined drop:${dropId}`);
    
    try {
      // Pobierz aktualny stan produktów dla tego dropu
      const dropKey = `drop:${dropId}:products`;
      const productIds = await redisClient.sMembers(dropKey);
      
      const productUpdates = [];
      
      for (const productId of productIds) {
        const productKey = `product:${productId}`;
        const productData = await redisClient.hGetAll(productKey);
        
        if (productData && Object.keys(productData).length > 0) {
          productUpdates.push({
            productId,
            available: parseInt(productData.available || 0),
            reserved: parseInt(productData.reserved || 0),
            sold: parseInt(productData.sold || 0)
          });
        }
      }
      
      // Wyślij początkowy stan produktów do klienta
      if (productUpdates.length > 0) {
        socket.emit('products-initial-state', productUpdates);
      }
    } catch (error) {
      console.error(`Error fetching initial product state for drop ${dropId}:`, error);
    }
  });
  
  // Obsługa rozłączenia
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Uruchomienie serwera
const PORT = process.env.WEBSOCKET_PORT || 4001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

// Funkcja pomocnicza do publikowania aktualizacji produktu
// Może być wywoływana z innych usług
async function publishProductUpdate(dropId, productId, available, reserved, sold) {
  try {
    if (!redisClient) {
      console.error('Redis client not connected');
      return;
    }
    
    // Aktualizuj dane w Redis
    const productKey = `product:${productId}`;
    await redisClient.hSet(productKey, {
      available, 
      reserved, 
      sold
    });
    
    // Dodaj produkt do zbioru produktów dropu (jeśli jeszcze nie istnieje)
    const dropKey = `drop:${dropId}:products`;
    await redisClient.sAdd(dropKey, productId);
    
    // Publikuj aktualizację przez Redis Pub/Sub
    await redisClient.publish('product-updates', JSON.stringify({
      dropId,
      productId,
      available,
      reserved,
      sold
    }));
    
    console.log(`Published update for product ${productId} in drop ${dropId}`);
  } catch (error) {
    console.error('Error publishing product update:', error);
  }
}

module.exports = {
  publishProductUpdate
};
