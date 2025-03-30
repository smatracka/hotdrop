#!/bin/bash
# Skrypt do wdrażania aplikacji Drop Commerce na Google Cloud Platform

# Kolory do wypisywania komunikatów
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Konfiguracja
PROJECT_ID="drop-commerce-project" # ID projektu GCP
BUCKET_NAME="drop-commerce-static" # Nazwa bucketa w Cloud Storage
REGION="europe-west3"               # Region GCP
SERVICE_ACCOUNT="drop-commerce-app@${PROJECT_ID}.iam.gserviceaccount.com"

# Upewnij się, że zalogowanie do GCP działa
echo -e "${YELLOW}Sprawdzanie uwierzytelnienia GCP...${NC}"
gcloud auth print-identity-token &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Błąd uwierzytelniania. Logowanie do GCP...${NC}"
  gcloud auth login
fi

# Ustaw aktywny projekt
echo -e "${YELLOW}Ustawianie projektu GCP...${NC}"
gcloud config set project $PROJECT_ID

# Funkcja do sprawdzania, czy komenda zakończyła się powodzeniem
check_command() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}Błąd: $1${NC}"
    exit 1
  else
    echo -e "${GREEN}$2${NC}"
  fi
}

# Buduj aplikację React
echo -e "${YELLOW}Budowanie aplikacji React...${NC}"
npm run build
check_command "Nieudane zbudowanie aplikacji" "Aplikacja zbudowana pomyślnie"

# Optymalizacja obrazów przed wdrożeniem
echo -e "${YELLOW}Optymalizacja zasobów...${NC}"
node scripts/optimize-images.js
check_command "Błąd optymalizacji obrazów" "Obrazy zoptymalizowane pomyślnie"

# Sprawdź, czy bucket istnieje, jeśli nie - utwórz go
echo -e "${YELLOW}Sprawdzanie bucketa Cloud Storage...${NC}"
gsutil ls -b gs://$BUCKET_NAME &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Tworzenie bucketa ${BUCKET_NAME}...${NC}"
  gsutil mb -c standard -l $REGION gs://$BUCKET_NAME
  check_command "Nie można utworzyć bucketa" "Bucket utworzony pomyślnie"
  
  # Konfiguracja bucketa jako strony statycznej
  echo -e "${YELLOW}Konfiguracja bucketa jako strony statycznej...${NC}"
  gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME
  check_command "Błąd konfiguracji strony statycznej" "Bucket skonfigurowany jako strona statyczna"
  
  # Ustaw uprawnienia publiczne dla bucketa
  echo -e "${YELLOW}Ustawianie buckets jako publiczny...${NC}"
  gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
  check_command "Błąd ustawiania uprawnień publicznych" "Bucket ustawiony jako publiczny"
  
  # Konfiguracja CORS dla bucketa
  echo -e "${YELLOW}Konfiguracja CORS...${NC}"
  cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF
  gsutil cors set cors.json gs://$BUCKET_NAME
  check_command "Błąd konfiguracji CORS" "CORS skonfigurowany pomyślnie"
  rm cors.json
fi

# Synchronizuj pliki z Google Drive (zasoby)
echo -e "${YELLOW}Synchronizacja zasobów z Google Drive...${NC}"
node scripts/sync-drive.js
check_command "Błąd synchronizacji zasobów z Google Drive" "Zasoby zsynchronizowane z Google Drive pomyślnie"

# Wdróż aplikację na Cloud Storage - katalog build
echo -e "${YELLOW}Wdrażanie aplikacji do Cloud Storage...${NC}"
gsutil -m cp -r build/* gs://$BUCKET_NAME/
check_command "Błąd wdrażania aplikacji" "Aplikacja wdrożona pomyślnie do Cloud Storage"

# Ustaw nagłówki Cache-Control dla różnych typów plików
echo -e "${YELLOW}Konfiguracja nagłówków cacheowania...${NC}"

# JS i CSS pliki - długi cache z haszem w nazwie
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" gs://$BUCKET_NAME/static/js/**.js gs://$BUCKET_NAME/static/css/**.css
check_command "Błąd ustawiania cache dla JS/CSS" "Nagłówki cache dla JS/CSS ustawione pomyślnie"

# Obrazy - długi cache
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/static/media/** gs://$BUCKET_NAME/assets/images/**
check_command "Błąd ustawiania cache dla obrazów" "Nagłówki cache dla obrazów ustawione pomyślnie"

# HTML - krótki cache aby szybko aktualizować
gsutil -m setmeta -h "Cache-Control:public, max-age=300, s-maxage=3600" gs://$BUCKET_NAME/*.html
check_command "Błąd ustawiania cache dla HTML" "Nagłówki cache dla HTML ustawione pomyślnie"

# Konfiguracja CDN dla bucketa
echo -e "${YELLOW}Konfiguracja Cloud CDN...${NC}"
gcloud compute backend-buckets describe drop-commerce-bucket-backend &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Tworzenie backend bucket dla CDN...${NC}"
  gcloud compute backend-buckets create drop-commerce-bucket-backend \
    --gcs-bucket-name=$BUCKET_NAME \
    --enable-cdn
  check_command "Błąd tworzenia backend buckets" "Backend bucket dla CDN utworzony pomyślnie"
else
  echo -e "${GREEN}Backend bucket już istnieje.${NC}"
fi

# Finalizacja
echo -e "${GREEN}Wdrożenie zakończone pomyślnie!${NC}"
echo -e "${YELLOW}URL strony: https://storage.googleapis.com/${BUCKET_NAME}/index.html${NC}"
echo -e "${YELLOW}Aby zobaczyć stronę w domenie własnej, skonfiguruj CNAME i Load Balancer.${NC}"
