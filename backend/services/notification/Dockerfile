FROM node:18-alpine

WORKDIR /app

# Kopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Instaluj zależności
RUN npm ci --only=production

# Kopiuj resztę plików aplikacji
COPY . .

# Stwórz katalog na logi
RUN mkdir -p /app/logs

# Eksponuj port
EXPOSE 4003

# Uruchom aplikację
CMD ["node", "server.js"]