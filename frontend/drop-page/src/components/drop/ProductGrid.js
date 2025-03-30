import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import './ProductGrid.css';

/**
 * Komponent siatki produktów
 * Wyświetla produkty w formie responsywnej siatki
 */
const ProductGrid = ({ 
  products, 
  onAddToCart,
  cartItems = {},
  blur = false,
  cartDisabled = false,
  emptyMessage = 'Brak produktów do wyświetlenia.',
  className = '',
  gridSize = 'medium' // small, medium, large
}) => {
  // Jeśli brak produktów
  if (!products || products.length === 0) {
    return (
      <div className="empty-products-message">
        {emptyMessage}
      </div>
    );
  }
  
  // Klasa CSS dla rozmiaru siatki
  const gridSizeClass = `product-grid--${gridSize}`;
  
  return (
    <div className={`product-grid ${gridSizeClass} ${className}`}>
      {products.map(product => {
        // Sprawdzenie czy produkt jest w koszyku
        const inCart = cartItems.hasOwnProperty(product.id);
        
        // Ilość produktu w koszyku (jeśli jest)
        const cartQuantity = inCart ? cartItems[product.id] : 0;
        
        return (
          <ProductCard 
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            inCart={inCart}
            cartQuantity={cartQuantity}
            blur={blur}
            cartDisabled={cartDisabled}
          />
        );
      })}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      description: PropTypes.string,
      imageName: PropTypes.string.isRequired,
      availableQuantity: PropTypes.number.isRequired,
      isBestseller: PropTypes.bool
    })
  ).isRequired,
  onAddToCart: PropTypes.func,
  cartItems: PropTypes.object,
  blur: PropTypes.bool,
  cartDisabled: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  gridSize: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default React.memo(ProductGrid);