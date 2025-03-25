#!/bin/bash
# Skrypt do inicjalizacji infrastruktury Google Cloud

set -e

# Zmienne konfiguracyjne
PROJECT_ID="drop-commerce"
REGION="europe-central2"
ZONE="europe-central2-a"
CLUSTER_NAME="drop-commerce-cluster"
BUCKET_NAME="drop-commerce-static"
REDIS_NAME="drop-commerce-redis"

# Kolory do logów
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ustawianie projektu Google Cloud ===${NC}"
gcloud config set project $PROJECT_ID

# Aktywacja wymaganych API
echo -e "${BLUE}=== Aktywacja wymaganych API Google Cloud ===${NC}"
gcloud services enable container.googleapis.com \
    compute.googleapis.com \
    storage-api.googleapis.com \
    redis.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com

# Tworzenie klastra Kubernetes
echo -e "${BLUE}=== Tworzenie klastra Kubernetes ===${NC}"
gcloud container clusters create $CLUSTER_NAME \
    --zone $ZONE \
    --num-nodes=3 \
    --machine-type=e2-standard-2 \
    --disk-size=30 \
    --enable-autoscaling \
    --min-nodes=3 \
    --max-nodes=10 \
    --release-channel=regular \
    --scopes=gke-default,compute-rw,storage-rw

# Pobieranie danych uwierzytelniających do kubectl
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE --project $PROJECT_ID

# Tworzenie przestrzeni nazw dla aplikacji
echo -e "${BLUE}=== Tworzenie przestrzeni nazw Kubernetes ===${NC}"
kubectl create namespace drop-commerce

# Tworzenie bucketa dla statycznych plików
echo -e "${BLUE}=== Tworzenie Cloud Storage Bucket ===${NC}"
gsutil mb -l $REGION gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Tworzenie instancji Redis
echo -e "${BLUE}=== Tworzenie instancji Redis (Memorystore) ===${NC}"
gcloud redis instances create $REDIS_NAME \
    --size=2 \
    --region=$REGION \
    --tier=basic \
    --redis-version=redis_6_x

# Pobieranie adresu IP Redis
REDIS_IP=$(gcloud redis instances describe $REDIS_NAME --region=$REGION --format='value(host)')
REDIS_PORT=$(gcloud redis instances describe $REDIS_NAME --region=$REGION --format='value(port)')

echo -e "${GREEN}=== Infrastruktura została skonfigurowana pomyślnie ===${NC}"
echo -e "${YELLOW}Redis Host: ${REDIS_IP}:${REDIS_PORT}${NC}"
echo -e "${YELLOW}Kubernetes Cluster: ${CLUSTER_NAME}${NC}"
echo -e "${YELLOW}Static Bucket: gs://${BUCKET_NAME}${NC}"

# Tworzenie sekretów w Secret Manager
echo -e "${BLUE}=== Tworzenie sekretów w Secret Manager ===${NC}"

# Generowanie losowego JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Tworzenie sekretów
echo -e "${BLUE}Tworzenie sekretu dla JWT${NC}"
printf "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

echo -e "${BLUE}Tworzenie sekretu dla URL Redis${NC}"
printf "redis://${REDIS_IP}:${REDIS_PORT}" | gcloud secrets create redis-url --data-file=-

echo -e "${BLUE}Stwórz ręcznie sekret 'mongodb-uri' w konsoli Google Cloud${NC}"

# Tworzenie sekretów w Kubernetes
echo -e "${BLUE}=== Tworzenie sekretów w Kubernetes ===${NC}"
kubectl create secret generic api-secrets \
    --namespace=drop-commerce \
    --from-literal=jwt-secret=$JWT_SECRET \
    --from-literal=redis-url=redis://${REDIS_IP}:${REDIS_PORT}

echo -e "${GREEN}=== Konfiguracja zakończona! ===${NC}"
echo -e "${YELLOW}WAŻNE: Ustaw sekret 'mongodb-uri' w Secret Manager i w sekrecie Kubernetes 'api-secrets'${NC}"

# scripts/deploy-frontend.sh
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
