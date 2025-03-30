/**
 * Narzędzie do optymalizacji obrazów dla Drop Commerce
 * Optymalizuje obrazy z katalogu źródłowego i zapisuje je w katalogu docelowym
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { existsSync, mkdirSync } = require('fs');
const glob = require('glob');
const chalk = require('chalk');

// Konfiguracja
const config = {
  // Katalog źródłowy
  sourceDir: path.resolve(__dirname, '../public/images'),
  
  // Katalog docelowy
  outputDir: path.resolve(__dirname, '../build/static/images'),
  
  // Rozmiary obrazów
  sizes: [
    { name: 'sm', width: 320 },
    { name: 'md', width: 640 },
    { name: 'lg', width: 1280 }
  ],
  
  // Jakość kompresji
  quality: {
    jpeg: 85,
    webp: 80,
    png: 80
  },
  
  // Maksymalna liczba równoległych operacji
  concurrency: 5,
  
  // Formaty wyjściowe (oprócz oryginalnego)
  outputFormats: ['webp']
};

/**
 * Optymalizuje pojedynczy obraz
 * @param {string} inputPath - Ścieżka do pliku wejściowego
 * @param {string} outputDir - Katalog wyjściowy
 * @param {Object} options - Opcje optymalizacji
 * @returns {Promise<void>}
 */
async function optimizeImage(inputPath, outputDir, options = {}) {
  const filename = path.basename(inputPath);
  const extension = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, extension);
  
  // Stwórz instancję sharp
  let image = sharp(inputPath);
  
  // Pobierz metadane obrazu
  const metadata = await image.metadata();
  
  // Określ format
  let format;
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      format = 'jpeg';
      break;
    case '.png':
      format = 'png';
      break;
    case '.webp':
      format = 'webp';
      break;
    case '.gif':
      format = 'gif';
      break;
    default:
      throw new Error(`Nieobsługiwany format obrazu: ${extension}`);
  }
  
  // Lista zadań optymalizacji
  const optimizationTasks = [];
  
  // Jeśli zdefiniowano rozmiary, wygeneruj obrazy w różnych rozmiarach
  if (options.sizes && options.sizes.length > 0) {
    for (const size of options.sizes) {
      const width = size.width;
      const suffix = size.name;
      
      // Tylko zmniejszaj obrazy, nie powiększaj
      if (width < metadata.width) {
        // Optymalizacja w oryginalnym formacie
        optimizationTasks.push(
          resizeAndSaveImage(
            inputPath,
            path.join(outputDir, `${basename}-${suffix}${extension}`),
            width,
            format,
            options.quality[format]
          )
        );
        
        // Jeśli podano dodatkowe formaty wyjściowe, wygeneruj je również
        if (options.outputFormats && options.outputFormats.length > 0) {
          for (const outputFormat of options.outputFormats) {
            // Pomiń jeśli format wyjściowy jest taki sam jak wejściowy
            if (outputFormat === format) continue;
            
            optimizationTasks.push(
              resizeAndSaveImage(
                inputPath,
                path.join(outputDir, `${basename}-${suffix}.${outputFormat}`),
                width,
                outputFormat,
                options.quality[outputFormat]
              )
            );
          }
        }
      }
    }
  }
  
  // Zawsze wygeneruj oryginalny obraz (zoptymalizowany)
  optimizationTasks.push(
    resizeAndSaveImage(
      inputPath,
      path.join(outputDir, filename),
      null, // brak zmiany rozmiaru
      format,
      options.quality[format]
    )
  );
  
  // Jeśli podano dodatkowe formaty wyjściowe, wygeneruj je również
  if (options.outputFormats && options.outputFormats.length > 0) {
    for (const outputFormat of options.outputFormats) {
      // Pomiń jeśli format wyjściowy jest taki sam jak wejściowy
      if (outputFormat === format) continue;
      
      optimizationTasks.push(
        resizeAndSaveImage(
          inputPath,
          path.join(outputDir, `${basename}.${outputFormat}`),
          null, // brak zmiany rozmiaru
          outputFormat,
          options.quality[outputFormat]
        )
      );
    }
  }
  
  // Wykonaj wszystkie zadania optymalizacji
  await Promise.all(optimizationTasks);
}

/**
 * Zmienia rozmiar i zapisuje obraz
 * @param {string} inputPath - Ścieżka do pliku wejściowego
 * @param {string} outputPath - Ścieżka do pliku wyjściowego
 * @param {number|null} width - Szerokość docelowa (null = bez zmiany rozmiaru)
 * @param {string} format - Format wyjściowy (jpeg, png, webp, gif)
 * @param {number} quality - Jakość kompresji
 * @returns {Promise<void>}
 */
async function resizeAndSaveImage(inputPath, outputPath, width, format, quality) {
  try {
    // Stwórz instancję sharp
    let image = sharp(inputPath);
    
    // Zmień rozmiar jeśli podano szerokość
    if (width) {
      image = image.resize(width, null, { withoutEnlargement: true });
    }
    
    // Zastosuj odpowiedni format z jakością
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'gif':
        image = image.gif();
        break;
    }
    
    // Zapisz obraz
    await image.toFile(outputPath);
    console.log(chalk.green(`Zapisano zoptymalizowany obraz: ${outputPath}`));
  } catch (error) {
    console.error(chalk.red(`Błąd podczas optymalizacji obrazu ${inputPath}:`), error);
    throw error;
  }
}

/**
 * Przetwarza obrazy partiami
 * @param {string[]} files - Lista plików do przetworzenia
 * @param {Object} options - Opcje optymalizacji
 * @returns {Promise<void>}
 */
async function processFilesInBatches(files, options) {
  const { concurrency, outputDir } = options;
  
  // Upewnij się, że katalog wyjściowy istnieje
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(chalk.blue(`Rozpoczęcie optymalizacji ${files.length} obrazów...`));
  
  // Przetwarzaj pliki w partiach
  const batches = [];
  for (let i = 0; i < files.length; i += concurrency) {
    batches.push(files.slice(i, i + concurrency));
  }
  
  let processed = 0;
  let success = 0;
  let errors = 0;
  
  for (const batch of batches) {
    const promises = batch.map(file => {
      return optimizeImage(file, outputDir, options)
        .then(() => {
          success++;
          return { status: 'success', file };
        })
        .catch(error => {
          errors++;
          console.error(chalk.red(`Błąd przetwarzania ${file}:`), error);
          return { status: 'error', file, error };
        });
    });
    
    await Promise.all(promises);
    
    processed += batch.length;
    console.log(chalk.blue(`Postęp: ${processed}/${files.length} obrazów (${Math.round(processed / files.length * 100)}%)`));
  }
  
  console.log(chalk.green(`\nOptymalizacja zakończona:`));
  console.log(chalk.green(`- Przetworzono: ${processed} obrazów`));
  console.log(chalk.green(`- Sukces: ${success} obrazów`));
  console.log(chalk.red(`- Błędy: ${errors} obrazów`));
}

/**
 * Główna funkcja optymalizacji obrazów
 * @returns {Promise<void>}
 */
async function optimizeImages() {
  try {
    const { sourceDir, outputDir, sizes, quality, concurrency, outputFormats } = config;
    
    // Sprawdź czy katalog źródłowy istnieje
    if (!existsSync(sourceDir)) {
      console.error(chalk.red(`Katalog źródłowy nie istnieje: ${sourceDir}`));
      return;
    }
    
    // Znajdź wszystkie obrazy w katalogu źródłowym
    const imageFiles = glob.sync(path.join(sourceDir, '**/*.@(jpg|jpeg|png|webp|gif)'));
    
    if (imageFiles.length === 0) {
      console.log(chalk.yellow('Nie znaleziono obrazów do optymalizacji.'));
      return;
    }
    
    // Przetwórz obrazy
    await processFilesInBatches(imageFiles, {
      outputDir,
      sizes,
      quality,
      concurrency,
      outputFormats
    });
    
  } catch (error) {
    console.error(chalk.red('Błąd podczas optymalizacji obrazów:'), error);
    process.exit(1);
  }
}

// Eksportuj funkcje
module.exports = {
  optimizeImages,
  optimizeImage,
  resizeAndSaveImage
};

// Uruchom bezpośrednio z linii poleceń
if (require.main === module) {
  optimizeImages().catch(err => {
    console.error(chalk.red('Nieoczekiwany błąd:'), err);
    process.exit(1);
  });
}