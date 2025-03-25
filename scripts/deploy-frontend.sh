#!/bin/bash
# Skrypt do wdrażania frontendu

set -e

# Zmienne konfiguracyjne
PROJECT_ID="drop-commerce"
BUCKET_NAME="drop-commerce-static"
FRONTEND_PATH="../frontend"

# Kolory do logów
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Budowanie aplikacji panelu sprzedawcy
echo -e "${BLUE}=== Budowanie panelu sprzedawcy ===${NC}"
cd $FRONTEND_PATH/seller-panel
npm run build

# Budowanie aplikacji panelu admina
echo -e "${BLUE}=== Budowanie panelu administratora ===${NC}"
cd ../admin-panel
npm run build

# Przesyłanie plików do Cloud Storage
echo -e "${BLUE}=== Przesyłanie statycznych plików do Cloud Storage ===${NC}"

# Przesyłanie plików panelu sprzedawcy
echo -e "${BLUE}Przesyłanie panelu sprzedawcy...${NC}"
gsutil -m cp -r $FRONTEND_PATH/seller-panel/build/* gs://$BUCKET_NAME/seller/

# Przesyłanie plików panelu administratora
echo -e "${BLUE}Przesyłanie panelu administratora...${NC}"
gsutil -m cp -r $FRONTEND_PATH/admin-panel/build/* gs://$BUCKET_NAME/admin/

# Konfiguracja CORS
echo -e "${BLUE}=== Konfiguracja CORS dla bucketa ===${NC}"
cat > cors.json << EOF
[
  {
    "origin": ["https://seller.dropcommerce.pl", "https://admin.dropcommerce.pl", "https://*.drop.dropcommerce.pl"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://$BUCKET_NAME
rm cors.json

# Konfiguracja hostingu stron
echo -e "${BLUE}=== Konfiguracja hostingu stron ===${NC}"

# Dla panelu sprzedawcy
cat > website.json << EOF
{
  "mainPageSuffix": "index.html",
  "notFoundPage": "index.html"
}
EOF

gsutil web set -m index.html -e index.html gs://$BUCKET_NAME/seller
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME/admin

rm website.json

echo -e "${GREEN}=== Frontend został wdrożony pomyślnie ===${NC}"
echo -e "${YELLOW}Panel sprzedawcy: https://seller.dropcommerce.pl${NC}"
echo -e "${YELLOW}Panel administratora: https://admin.dropcommerce.pl${NC}"
echo -e "${YELLOW}UWAGA: Upewnij się, że masz skonfigurowane odpowiednie rekordy DNS wskazujące na bucket.${NC}"

# scripts/deploy-backend.sh
#!/bin/bash
# Skrypt do wdrażania backendu

set -e

# Zmienne konfiguracyjne
PROJECT_ID="drop-commerce"
BACKEND_PATH="../backend"
CLUSTER_NAME="drop-commerce-cluster"
ZONE="europe-central2-a"

# Kolory do logów
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Pobieranie danych uwierzytelniających do kubectl
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE --project $PROJECT_ID

# Budowanie i publikowanie obrazu API
echo -e "${BLUE}=== Budowanie i publikowanie obrazu API ===${NC}"
cd $BACKEND_PATH/api
docker build -t gcr.io/$PROJECT_ID/drop-commerce-api:latest .
docker push gcr.io/$PROJECT_ID/drop-commerce-api:latest

# Budowanie i publikowanie obrazu WebSocket
echo -e "${BLUE}=== Budowanie i publikowanie obrazu WebSocket ===${NC}"
cd ../websocket
docker build -t gcr.io/$PROJECT_ID/drop-commerce-websocket:latest .
docker push gcr.io/$PROJECT_ID/drop-commerce-websocket:latest

# Wdrażanie do Kubernetes
echo -e "${BLUE}=== Wdrażanie do Kubernetes ===${NC}"

# Wdrażanie API
echo -e "${BLUE}Wdrażanie API...${NC}"
kubectl apply -f ../infrastructure/kubernetes/api/deployment.yaml
kubectl apply -f ../infrastructure/kubernetes/api/service.yaml
kubectl apply -f ../infrastructure/kubernetes/api/hpa.yaml

# Wdrażanie WebSocket
echo -e "${BLUE}Wdrażanie WebSocket...${NC}"
kubectl apply -f ../infrastructure/kubernetes/websocket/deployment.yaml
kubectl apply -f ../infrastructure/kubernetes/websocket/service.yaml

# Wdrażanie Ingress
echo -e "${BLUE}Wdrażanie Ingress...${NC}"
kubectl apply -f ../infrastructure/kubernetes/frontend-config.yaml
kubectl apply -f ../infrastructure/kubernetes/ingress.yaml

echo -e "${GREEN}=== Backend został wdrożony pomyślnie ===${NC}"
echo -e "${YELLOW}API powinno być dostępne pod: https://api.dropcommerce.pl${NC}"
echo -e "${YELLOW}WebSocket powinny być dostępne pod: https://ws.dropcommerce.pl${NC}"
echo -e "${YELLOW}UWAGA: Konfiguracja DNS i certyfikatów SSL może zająć do 24 godzin.${NC}"

# Monitorowanie statusu podów
echo -e "${BLUE}=== Status podów ===${NC}"
kubectl get pods -n drop-commerce

# Monitorowanie usług
echo -e "${BLUE}=== Status usług ===${NC}"
kubectl get services -n drop-commerce
