/**
 * Skrypt synchronizacji zasobów z Google Drive do Google Cloud Storage
 * Pobiera pliki z określonego folderu Google Drive, optymalizuje obrazy i wgrywa do Cloud Storage
 */
const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');
const chalk = require('chalk');

// Konfiguracja
const CONFIG = {
  // ID folderu w Google Drive
  DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID || 'YOUR_DRIVE_FOLDER_ID',
  
  // Bucket Cloud Storage
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || 'drop-commerce-static',
  
  // Rozmiary obrazów
  IMAGE_SIZES: [
    { suffix: '-sm', width: 320 },
    { suffix: '-md', width: 640 },
    { suffix: '-lg', width: 1280 }
  ],
  
  // Obsługiwane typy obrazów
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // Jakość kompresji JPEG/WebP
  JPEG_QUALITY: 85,
  WEBP_QUALITY: 80,
  
  // Ścieżki w Cloud Storage
  STORAGE_PATHS: {
    IMAGES: 'assets/images/',
    VIDEOS: 'assets/videos/',
    DOCUMENTS: 'assets/documents/',
    OTHER: 'assets/'
  },
  
  // Limity
  MAX_CONCURRENT_UPLOADS: 5
};

/**
 * Główna funkcja synchronizacji
 */
async function syncDriveToStorage() {
  try {
    console.log(chalk.blue('=== Rozpoczęcie synchronizacji zasobów z Google Drive do Cloud Storage ==='));
    
    // Autoryzacja Google Drive API
    const auth = await getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    // Inicjalizacja Cloud Storage
    const storage = new Storage();
    const bucket = storage.bucket(CONFIG.STORAGE_BUCKET);
    
    console.log(chalk.blue(`Pobieranie plików z folderu Google Drive ID: ${CONFIG.DRIVE_FOLDER_ID}`));
    
    // Pobierz listę plików z folderu
    const driveRes = await drive.files.list({
      q: `'${CONFIG.DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime, size)'
    });
    
    const files = driveRes.data.files;
    console.log(chalk.green(`Znaleziono ${files.length} plików w Google Drive.`));
    
    // Przetwarzanie plików
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Przetwarzaj pliki w paczkach, aby uniknąć przepełnienia pamięci
    const chunkSize = CONFIG.MAX_CONCURRENT_UPLOADS;
    for (let i = 0; i < files.length; i += chunkSize) {
      const fileChunk = files.slice(i, i + chunkSize);
      const promises = fileChunk.map(file => processFile(file, drive, bucket));
      
      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'success') {
            successCount++;
          } else if (result.value.status === 'skipped') {
            skippedCount++;
          }
        } else {
          errorCount++;
          console.error(chalk.red(`Błąd: ${result.reason}`));
        }
      });
      
      console.log(chalk.blue(`Przetworzono ${i + fileChunk.length}/${files.length} plików...`));
    }
    
    console.log(chalk.green('\n=== Synchronizacja zakończona ==='));
    console.log(chalk.green(`Pomyślnie przetworzono: ${successCount} plików`));
    console.log(chalk.yellow(`Pominięto: ${skippedCount} plików`));
    console.log(chalk.red(`Błędy: ${errorCount} plików`));
    
  } catch (error) {
    console.error(chalk.red('Błąd podczas synchronizacji zasobów:'), error);
    process.exit(1);
  }
}

/**
 * Pobierz uwierzytelnienie Google
 */
async function getGoogleAuth() {
  try {
    return new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
  } catch (error) {
    console.error(chalk.red('Błąd uwierzytelniania Google:'), error);
    throw error;
  }
}

/**
 * Przetwarzanie pojedynczego pliku
 * @param {Object} file - Dane pliku z Google Drive
 * @param {Object} drive - Instancja Google Drive API
 * @param {Object} bucket - Instancja Cloud Storage bucket
 * @returns {Promise<Object>} Status przetwarzania
 */
async function processFile(file, drive, bucket) {
  try {
    console.log(chalk.blue(`Przetwarzanie pliku: ${file.name} (${file.mimeType})`));
    
    // Pobierz plik z Drive
    const tempFilePath = path.join(os.tmpdir(), file.name);
    
    const driveResponse = await drive.files.get(
      { fileId: file.id, alt: 'media' }, 
      { responseType: 'stream' }
    );
    
    // Zapisz plik tymczasowo
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(tempFilePath);
      driveResponse.data.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Określenie typu pliku
    const isImage = CONFIG.IMAGE_TYPES.includes(file.mimeType);
    const fileExtension = path.extname(file.name);
    const fileName = path.basename(file.name, fileExtension);
    
    // Określenie ścieżki docelowej w Cloud Storage
    let storagePath;
    if (isImage) {
      storagePath = CONFIG.STORAGE_PATHS.IMAGES;
    } else if (file.mimeType.startsWith('video/')) {
      storagePath = CONFIG.STORAGE_PATHS.VIDEOS;
    } else if (file.mimeType.startsWith('application/')) {
      storagePath = CONFIG.STORAGE_PATHS.DOCUMENTS;
    } else {
      storagePath = CONFIG.STORAGE_PATHS.OTHER;
    }
    
    // Procesowanie obrazów
    if (isImage) {
      // Sprawdź, czy obraz już istnieje
      const originalImagePath = `${storagePath}${file.name}`;
      const [exists] = await bucket.file(originalImagePath).exists();
      
      // Nie aktualizujemy istniejących obrazów
      if (exists) {
        console.log(chalk.yellow(`Pominięto istniejący obraz: ${originalImagePath}`));
        fs.unlinkSync(tempFilePath); // Usuń plik tymczasowy
        return { status: 'skipped' };
      }
      
      // Optymalizuj i wgraj oryginalny obraz
      await optimizeAndUploadImage(tempFilePath, `${storagePath}${file.name}`, bucket, null);
      
      // Wgraj wersje w różnych rozmiarach
      for (const size of CONFIG.IMAGE_SIZES) {
        const resizedFileName = `${fileName}${size.suffix}${fileExtension}`;
        await optimizeAndUploadImage(
          tempFilePath, 
          `${storagePath}${resizedFileName}`, 
          bucket,
          size.width
        );
      }
      
      // Wygeneruj WebP dla każdego rozmiaru
      if (['.jpg', '.jpeg', '.png'].includes(fileExtension.toLowerCase())) {
        // Oryginalny w WebP
        await optimizeAndUploadImage(
          tempFilePath, 
          `${storagePath}${fileName}.webp`, 
          bucket, 
          null, 
          'webp'
        );
        
        // WebP w różnych rozmiarach
        for (const size of CONFIG.IMAGE_SIZES) {
          const resizedFileName = `${fileName}${size.suffix}.webp`;
          await optimizeAndUploadImage(
            tempFilePath, 
            `${storagePath}${resizedFileName}`, 
            bucket,
            size.width,
            'webp'
          );
        }
      }
    } else {
      // Dla zwykłych plików, prześlij bez modyfikacji
      await bucket.upload(tempFilePath, {
        destination: `${storagePath}${file.name}`,
        metadata: {
          cacheControl: 'public, max-age=31536000' // Cache na rok
        }
      });
      
      console.log(chalk.green(`Plik ${file.name} przesłany do: gs://${CONFIG.STORAGE_BUCKET}/${storagePath}${file.name}`));
    }
    
    // Usuń tymczasowy plik
    fs.unlinkSync(tempFilePath);
    
    return { status: 'success' };
  } catch (error) {
    console.error(chalk.red(`Błąd podczas przetwarzania pliku ${file.name}:`), error);
    throw error;
  }
}

/**
 * Optymalizacja i wgrywanie obrazów
 * @param {string} sourcePath - Ścieżka źródłowa pliku
 * @param {string} destinationPath - Ścieżka docelowa w Cloud Storage
 * @param {Object} bucket - Instancja Cloud Storage bucket
 * @param {number|null} width - Docelowa szerokość (null = bez zmiany rozmiaru)
 * @param {string|null} format - Docelowy format (null = bez zmiany formatu)
 * @returns {Promise<void>}
 */
async function optimizeAndUploadImage(sourcePath, destinationPath, bucket, width = null, format = null) {
  try {
    let transformer = sharp(sourcePath);
    
    // Zmień rozmiar jeśli podano szerokość
    if (width) {
      transformer = transformer.resize(width, null, { withoutEnlargement: true });
    }
    
    // Opcje w zależności od formatu
    if (format === 'webp') {
      transformer = transformer.webp({ quality: CONFIG.WEBP_QUALITY });
    } else if (format === 'jpeg' || format === 'jpg') {
      transformer = transformer.jpeg({ quality: CONFIG.JPEG_QUALITY });
    } else if (format) {
      transformer = transformer.toFormat(format);
    }
    
    // Wykonaj transformację
    const buffer = await transformer.toBuffer();
    
    // Określ typ zawartości na podstawie formatu
    let contentType;
    if (format === 'webp') {
      contentType = 'image/webp';
    } else if (format === 'jpeg' || format === 'jpg') {
      contentType = 'image/jpeg';
    } else if (format === 'png') {
      contentType = 'image/png';
    } else if (format === 'gif') {
      contentType = 'image/gif';
    }
    
    // Wgraj na Cloud Storage
    const file = bucket.file(destinationPath);
    await file.save(buffer, {
      metadata: {
        contentType: contentType || null,
        cacheControl: 'public, max-age=31536000' // Cache na rok
      }
    });
    
    console.log(chalk.green(`Obraz zapisany w: gs://${CONFIG.STORAGE_BUCKET}/${destinationPath}`));
  } catch (error) {
    console.error(chalk.red(`Błąd optymalizacji obrazu ${destinationPath}:`), error);
    throw error;
  }
}

// Uruchomienie głównej funkcji
syncDriveToStorage().catch(error => {
  console.error(chalk.red('Błąd podczas synchronizacji:'), error);
  process.exit(1);
});