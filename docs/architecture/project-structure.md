# Struktura projektu Drop eCommerce

## Przegląd

Projekt Drop eCommerce jest zorganizowany według zasad architektury mikrousługowej, z wyraźnym podziałem na część frontendową i backendową. Całość jest zaprojektowana do wdrożenia w środowisku Google Cloud, z wykorzystaniem Kubernetes do orkiestracji kontenerów i Cloud Storage do przechowywania statycznych zasobów.

## Główne komponenty

### Frontend

```
frontend/
├── seller-panel/           # Panel sprzedawcy
│   ├── public/             # Statyczne zasoby
│   └── src/                # Kod źródłowy React
├── admin-panel/            # Panel administratora
│   ├── public/
│   └── src/
└── drop-page/              # Strona dropu (statyczna)
    ├── public/
    └── src/
```

### Backend

```
backend/
├── api/                    # Główne API REST
│   ├── controllers/        # Kontrolery obsługujące żądania
│   ├── models/             # Modele danych (Mongoose)
│   ├── routes/             # Definicje tras API
│   ├── middlewares/        # Middleware (np. autoryzacja)
│   ├── services/           # Logika biznesowa
│   └── utils/              # Funkcje pomocnicze
├── websocket/              # Serwer WebSocket do aktualizacji w czasie rzeczywistym
└── services/               # Mikrousługi
    ├── payment/            # Serwis płatności
    ├── inventory/          # Serwis zarządzania zapasami
    └── notification/       # Serwis powiadomień
```

### Infrastruktura

```
infrastructure/
├── kubernetes/             # Konfiguracja Kubernetes
│   ├── api/                # Konfiguracja dla API
│   ├── websocket/          # Konfiguracja dla WebSocket
│   └── ingress/            # Konfiguracja Ingress
├── cloud-storage/          # Konfiguracja Cloud Storage
├── memorystore/            # Konfiguracja Redis
└── cdn/                    # Konfiguracja CDN
```

### Skrypty wdrożeniowe

```
scripts/
├── deploy-frontend.sh      # Skrypt do wdrażania frontendu
├── deploy-backend.sh       # Skrypt do wdrażania backendu
└── setup-infra.sh          # Skrypt do konfiguracji infrastruktury
```

### Cloud Functions

```
functions/
├── generate-drop-page/     # Funkcja generująca stronę dropu
└── process-payment/        # Funkcja przetwarzająca płatności
```

### Dokumentacja

```
docs/
├── api/                    # Dokumentacja API
├── deployment/             # Instrukcje wdrażania
└── architecture/           # Architektura systemu
```

## Przepływ danych

1. **Tworzenie dropu**:
   - Sprzedawca tworzy drop w panelu sprzedawcy
   - API zapisuje dane dropu w MongoDB
   - Cloud Function generuje statyczną stronę dropu i przechowuje ją w Cloud Storage

2. **Proces zakupu**:
   - Użytkownik wchodzi na stronę dropu
   - WebSockets dostarczają aktualizacje o dostępności produktów w czasie rzeczywistym
   - Użytkownik dodaje produkt do koszyka (rezerwacja w Redis)
   - Płatność BLIK jest przetwarzana przez serwis płatności
   - Po potwierdzeniu płatności, zamówienie jest zapisywane w MongoDB

3. **Monitorowanie i analityka**:
   - Panel sprzedawcy wyświetla statystyki w czasie rzeczywistym
   - Panel administratora umożliwia globalne zarządzanie platformą

## Architektura techniczna

### Frontend

- **Technologie**: React, TypeScript, Material-UI
- **Hosting**: Google Cloud Storage + Cloud CDN
- **Komunikacja w czasie rzeczywistym**: WebSockets
- **Zarządzanie stanem**: React Context API
- **Walidacja formularzy**: React Hook Form + Yup

### Backend

- **Framework**: Node.js z Express
- **Baza danych**: MongoDB (Atlas)
- **Cache**: Redis (Google Cloud Memorystore)
- **Uwierzytelnianie**: JWT
- **Zarządzanie sekretami**: Google Cloud Secret Manager

### Infrastruktura

- **Platforma chmurowa**: Google Cloud Platform
- **Orkiestracja kontenerów**: Kubernetes (GKE)
- **CI/CD**: Google Cloud Build
- **Monitoring**: Google Cloud Monitoring + Logging
- **Domeny i SSL**: Google-managed certificates

## Model danych

### Drop

```javascript
{
  name: String,
  description: String,
  slug: String,
  startDate: Date,
  timeLimit: Number,
  status: String, // draft, published, completed, cancelled
  products: [{ type: ObjectId, ref: 'Product' }],
  seller: { type: ObjectId, ref: 'User' },
  customization: {
    headerColor: String,
    buttonColor: String,
    fontColor: String,
    backgroundColor: String,
    logoUrl: String
  },
  statistics: {
    visits: Number,
    orders: Number,
    revenue: Number
  }
}
```

### Product

```javascript
{
  name: String,
  description: String,
  sku: String,
  price: Number,
  quantity: Number,
  reserved: Number,
  sold: Number,
  imageUrls: [String],
  category: String,
  status: String, // active, draft, hidden, out_of_stock
  drops: [{ type: ObjectId, ref: 'Drop' }],
  seller: { type: ObjectId, ref: 'User' }
}
```

### Order

```javascript
{
  orderNumber: String,
  customer: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  items: [{
    product: { type: ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    total: Number
  }],
  drop: { type: ObjectId, ref: 'Drop' },
  seller: { type: ObjectId, ref: 'User' },
  totalAmount: Number,
  status: String, // pending, paid, shipped, delivered, cancelled
  paymentMethod: String, // blik
  paymentId: String,
  paymentStatus: String, // pending, completed, failed
  createdAt: Date,
  updatedAt: Date
}
```

### User (Seller)

```javascript
{
  name: String,
  email: String,
  password: String, // hashed
  role: String, // seller, admin
  company: {
    name: String,
    vatId: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  settings: {
    currency: String,
    language: String,
    notifications: {
      email: Boolean,
      sms: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Skalowanie

Platforma została zaprojektowana, aby obsłużyć setki tysięcy jednoczesnych użytkowników podczas dropu:

1. **Statyczne strony dropu** - Serwowane z Cloud Storage i CDN, minimalizując obciążenie serwera
2. **Autoskalowanie Kubernetes** - Automatyczne zwiększanie liczby replik w odpowiedzi na ruch
3. **Redis dla sesji i rezerwacji** - Szybkie operacje w pamięci dla krytycznych funkcji
4. **Ograniczenia czasu sesji** - 10-minutowe okno czasowe na zakup ogranicza długość sesji
5. **Architektura zdarzeń** - WebSockets i kolejki wiadomości do przetwarzania asynchronicznego

## Bezpieczeństwo

1. **Uwierzytelnianie JWT** - Bezpieczne tokeny dla panelu sprzedawcy i administratora
2. **HTTPS** - Wszystkie połączenia szyfrowane z certyfikatami zarządzanymi przez Google
3. **Google Cloud IAM** - Precyzyjne zarządzanie dostępem do zasobów infrastruktury
4. **Walidacja danych** - Kompleksowa walidacja wszystkich danych wejściowych
5. **Zgodność z RODO** - Mechanizmy eksportu i usuwania danych użytkowników
6. **Rate limiting** - Ochrona przed atakami brute-force i DDoS

## Wdrożenie

Szczegółowe instrukcje wdrożenia znajdują się w katalogu `docs/deployment/`. Krótkie podsumowanie:

1. Konfiguracja infrastruktury GCP za pomocą `scripts/setup-infra.sh`
2. Wdrożenie backendu za pomocą `scripts/deploy-backend.sh`
3. Wdrożenie frontendu za pomocą `scripts/deploy-frontend.sh`
4. Konfiguracja domen i DNS
5. Testowanie i monitorowanie
