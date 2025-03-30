import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CloudImage from '../common/CloudImage';
import './ProductCard.css';

/**
 * Komponent karty produktu w dropie
 * Wyświetla miniaturkę, nazwę, cenę, dostępną ilość i przycisk dodania do koszyka
 */
const ProductCard = ({ 
  product, 
  onAddToCart,
  inCart = false,
  blur = false,
  className = '',
  cartDisabled = false
}) => {
  const [quantity, setQuantity] = useState(1);
  
  // Obsługa zmiany ilości
  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, Math.min(product.availableQuantity, quantity + amount));
    setQuantity(newQuantity);
  };
  
  // Obsługa dodania do koszyka
  const handleAddToCart = () => {
    if (onAddToCart && !cartDisabled && product.availableQuantity > 0) {
      onAddToCart(product.id, quantity);
    }
  };
  
  // Sprawdzenie czy produkt jest dostępny
  const isAvailable = product.availableQuantity > 0;
  
  // Sprawdzenie czy zostało mało sztuk
  const isLowStock = isAvailable && product.availableQuantity <= 5;
  
  return (
    <div className={`product-card ${className} ${!isAvailable ? 'product-card--sold-out' : ''}`}>
      <div className="product-image-container">
        {/* Etykiety produktu */}
        {product.isBestseller && isAvailable && (
          <span className="product-tag bestseller">Bestseller</span>
        )}
        
        {isLowStock && (
          <span className="product-tag low-stock">Ostatnie sztuki!</span>
        )}
        
        {/* Obraz produktu */}
        <CloudImage 
          name={product.imageName} 
          alt={product.name}
          blur={blur}
          lazy={true}
          size="md"
        />
        
        {/* Nakładka "Wyprzedane" */}
        {!isAvailable && (
          <div className="product-sold-out">Wyprzedane</div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-details">
          <div className="product-price">{product.price.toFixed(2)} zł</div>
          <div className={`product-stock ${isLowStock ? 'low-stock' : ''}`}>
            Dostępne: {product.availableQuantity} szt.
          </div>
        </div>
        
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        
        {/* Akcje produktu (zmiana ilości i dodanie do koszyka) */}
        {isAvailable && !blur && (
          <div className="product-actions">
            <div className="quantity-control">
              <button 
                className="quantity-btn" 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <div className="quantity-value">{quantity}</div>
              <button 
                className="quantity-btn" 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.availableQuantity}
              >
                +
              </button>
            </div>
            
            <button 
              className={`add-to-cart ${inCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={cartDisabled || !isAvailable}
            >
              {inCart ? 'W koszyku' : 'Dodaj do koszyka'}
            </button>
          </div>
        )}
        
        {/* Przycisk dla wyprzedanych produktów */}
        {!isAvailable && !blur && (
          <button className="add-to-cart disabled" disabled>
            Wyprzedane
          </button>
        )}
        
        {/* Przycisk dla trybu blur (przed dropem) */}
        {blur && (
          <button className="join-drop-button">
            Weź udział w dropie
          </button>
        )}
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
    imageName: PropTypes.string.isRequired,
    availableQuantity: PropTypes.number.isRequired,
    isBestseller: PropTypes.bool
  }).isRequired,
  onAddToCart: PropTypes.func,
  inCart: PropTypes.bool,
  blur: PropTypes.bool,
  className: PropTypes.string,
  cartDisabled: PropTypes.bool
};

export default React.memo(ProductCard);