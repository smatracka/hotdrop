import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { STORAGE } from '../../config/constants';
import './CloudImage.css';

/**
 * Komponent do ładowania obrazów z Google Cloud Storage
 * Obsługuje różne rozmiary i formaty obrazów, lazy loading, placeholdery
 */
const CloudImage = ({
  imageName,
  alt,
  size = 'md',
  format = 'webp',
  className = '',
  loading = 'lazy',
  fallbackUrl = null,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [url, setUrl] = useState('');
  
  // Generowanie URL obrazu
  useEffect(() => {
    // Jeśli brak nazwy obrazu, użyj fallbackUrl
    if (!imageName) {
      setUrl(fallbackUrl || '/assets/images/placeholder.webp');
      return;
    }
    
    // Pobierz sufix rozmiaru z konfiguracji
    const sizeConfig = STORAGE.IMAGE_SIZES[size] || STORAGE.IMAGE_SIZES.md;
    const sizePrefix = sizeConfig.suffix;
    
    // Określenie nazwy pliku z odpowiednim rozmiarem i formatem
    const fileName = `${imageName}${sizePrefix}.${format}`;
    
    // Kompletny URL
    setUrl(`${STORAGE.BASE_URL}${STORAGE.IMAGES_PATH}/${fileName}`);
  }, [imageName, size, format, fallbackUrl]);
  
  // Obsługa zdarzenia załadowania obrazu
  const handleLoad = (e) => {
    setImageLoaded(true);
    if (onLoad) onLoad(e);
  };
  
  // Obsługa zdarzenia błędu ładowania obrazu
  const handleError = (e) => {
    setImageError(true);
    
    // Spróbuj załadować oryginalny format jeśli webp zawiódł
    if (format === 'webp' && imageName) {
      // Pobierz rozszerzenie z nazwy pliku lub użyj jpg jako domyślnego
      const originalExtension = imageName.includes('.') 
        ? imageName.split('.').pop() 
        : 'jpg';
      
      // Pobierz sufix rozmiaru z konfiguracji
      const sizeConfig = STORAGE.IMAGE_SIZES[size] || STORAGE.IMAGE_SIZES.md;
      const sizePrefix = sizeConfig.suffix;
      
      // Ustaw URL na oryginalny format
      setUrl(`${STORAGE.BASE_URL}${STORAGE.IMAGES_PATH}/${imageName}${sizePrefix}.${originalExtension}`);
    } else if (fallbackUrl) {
      // Użyj fallbackUrl jeśli dostępny
      setUrl(fallbackUrl);
    } else {
      // Ostatecznie użyj placeholdera
      setUrl('/assets/images/placeholder.webp');
    }
    
    if (onError) onError(e);
  };
  
  // Klasy CSS do animacji wejścia
  const imageClasses = [
    'cloud-image',
    imageLoaded ? 'loaded' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="cloud-image-wrapper">
      {!imageLoaded && !imageError && (
        <div className="cloud-image-placeholder" />
      )}
      
      <img
        src={url}
        alt={alt}
        className={imageClasses}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

CloudImage.propTypes = {
  imageName: PropTypes.string,
  alt: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  format: PropTypes.oneOf(['webp', 'jpg', 'png']),
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  fallbackUrl: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default CloudImage;