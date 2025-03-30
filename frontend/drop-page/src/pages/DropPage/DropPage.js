import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import ProductGrid from '../../components/drop/ProductGrid';
import ShoppingTimer from '../../components/drop/ShoppingTimer';
import QueueSystem from '../../components/drop/QueueSystem';
import Button from '../../components/common/Button';
import { fetchDropDetails, fetchQueueStatus } from '../../services/api/dropService';
import { addToCart, getCart, clearCart } from '../../services/api/cartService';
import './DropPage.css';

/**
 * Strona aktywnego dropu
 * Wyświetla produkty, koszyk, timer zakupowy i system kolejkowy
 */
const DropPage = () => {
  const { dropId } = useParams();
  const navigate = useNavigate();
  
  // Stany komponentu
  const [dropData, setDropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inQueue, setInQueue] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [cartTotal, setCartTotal] = useState(0);
  const [productsData, setProductsData] = useState([]);
  const [dropStats, setDropStats] = useState({
    availableProducts: 0,
    soldProducts: 0,
    inCartProducts: 0
  });

  // Pobieranie danych o dropie
  useEffect(() => {
    const loadDropData = async () => {
      try {
        setLoading(true);
        
        // Pobierz dane o dropie
        const data = await fetchDropDetails(dropId);
        setDropData(data);
        
        // Aktualizuj produkty
        setProductsData(data.products);
        
        // Aktualizuj statystyki dropu
        updateDropStats(data.products, cartItems);
        
        // Sprawdź status kolejki
        checkQueueStatus();
        
        // Pobierz koszyk
        const cartData = await getCart(dropId);
        setCartItems(cartData.items || {});
        setCartTotal(cartData.total || 0);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading drop data:', err);
        setError('Nie udało się załadować danych dropu. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    loadDropData();
  }, [dropId]);

  // Sprawdzanie statusu kolejki
  const checkQueueStatus = async () => {
    try {
      const queueStatus = await fetchQueueStatus(dropId);
      if (queueStatus.inQueue) {
        setInQueue(true);
        setQueueData(queueStatus);
      } else {
        setInQueue(false);
      }
    } catch (err) {
      console.error('Error checking queue status:', err);
      // Nie ustawiamy błędu, aby nie przerywać ładowania dropu
    }
  };

  // Aktualizacja statystyk dropu
  const updateDropStats = (products, cart) => {
    const availableProducts = products.reduce((sum, product) => sum + product.availableQuantity, 0);
    const soldProducts = products.reduce((sum, product) => sum + (product.initialQuantity - product.availableQuantity), 0);
    const inCartProducts = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    
    setDropStats({
      availableProducts,
      soldProducts,
      inCartProducts
    });
  };

  // Obsługa dodania do koszyka
  const handleAddToCart = async (productId, quantity) => {
    try {
      // Wywołanie API dodania do koszyka
      const result = await addToCart(dropId, productId, quantity);
      
      if (result.success) {
        // Aktualizacja stanu koszyka
        setCartItems(result.items);
        setCartTotal(result.total);
        
        // Aktualizacja dostępności produktów
        const updatedProducts = productsData.map(product => 
          product.id === productId
            ? { ...product, availableQuantity: product.availableQuantity - quantity }
            : product
        );
        
        setProductsData(updatedProducts);
        
        // Aktualizacja statystyk
        updateDropStats(updatedProducts, result.items);
      } else {
        console.error('Nie udało się dodać produktu do koszyka:', result.error);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Obsługa zakończenia czasu zakupów
  const handleTimeEnd = async () => {
    // Wyczyść koszyk
    await clearCart(dropId);
    
    // Wyświetl powiadomienie
    alert('Czas na zakupy dobiegł końca. Twój koszyk został opróżniony.');
    
    // Przekieruj na stronę dropu (odświeżenie)
    window.location.reload();
  };

  // Obsługa zakończenia oczekiwania w kolejce
  const handleQueueComplete = () => {
    setInQueue(false);
    // Odświeżenie strony, aby załadować najnowsze dane
    window.location.reload();
  };

  // Obsługa finalizacji zamówienia
  const handleCheckout = () => {
    navigate(`/drops/${dropId}/checkout`);
  };

  // Jeśli użytkownik jest w kolejce, wyświetl komponent kolejki
  if (inQueue && queueData) {
    return (
      <QueueSystem
        position={queueData.position}
        queueLength={queueData.queueLength}
        estimatedWaitTime={queueData.estimatedWaitTime}
        onQueueComplete={handleQueueComplete}
      />
    );
  }

  // Zawartość podczas ładowania
  if (loading) {
    return (
      <div className="drop-page">
        <PageHeader />
        <main className="drop-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie dropu...</p>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  // Zawartość w przypadku błędu
  if (error) {
    return (
      <div className="drop-page">
        <PageHeader />
        <main className="drop-content">
          <div className="container">
            <div className="error-container">
              <div className="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2>Wystąpił błąd</h2>
              <p>{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="drop-page">
      <PageHeader cartItemsCount={Object.keys(cartItems).length} />
      
      <main className="drop-content">
        <div className="container">
          <div className="drop-header">
            <div className="drop-title-section">
              <h1 className="drop-title">{dropData.name}</h1>
              
              <div className="drop-stats">
                <div className="drop-stat">
                  <span className="stat-label">Produktów dostępnych:</span>
                  <span className="stat-value">{dropStats.availableProducts}</span>
                </div>
                <div className="drop-stat">
                  <span className="stat-label">Produktów sprzedanych:</span>
                  <span className="stat-value">{dropStats.soldProducts}</span>
                </div>
                <div className="drop-stat">
                  <span className="stat-label">W Twoim koszyku:</span>
                  <span className="stat-value">{dropStats.inCartProducts}</span>
                </div>
              </div>
            </div>
            
            <div className="shopping-timer-container">
              <ShoppingTimer
                initialTime={600} // 10 minut
                onTimeEnd={handleTimeEnd}
                warningTime={120} // 2 minuty
                size="medium"
              />
            </div>
          </div>
          
          {/* Koszyk */}
          {Object.keys(cartItems).length > 0 && (
            <div className="cart-section">
              <h2 className="section-title">Twój koszyk</h2>
              
              <div className="cart-items">
                {productsData
                  .filter(product => cartItems[product.id])
                  .map(product => (
                    <div key={product.id} className="cart-item">
                      <div className="cart-item-image">
                        <img 
                          src={`https://storage.googleapis.com/drop-commerce-static/assets/images/${product.imageName}-sm.webp`}
                          alt={product.name}
                        />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-name">{product.name}</div>
                        <div className="cart-item-price">{product.price.toFixed(2)} zł</div>
                      </div>
                      <div className="cart-item-quantity">
                        <div className="quantity-display">
                          Ilość: {cartItems[product.id]}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Razem do zapłaty:</span>
                  <span className="cart-total-value">{cartTotal.toFixed(2)} zł</span>
                </div>
                
                <Button 
                  variant="primary" 
                  size="large" 
                  onClick={handleCheckout}
                  className="checkout-button"
                >
                  Przejdź do płatności
                </Button>
              </div>
            </div>
          )}
          
          {/* Produkty */}
          <div className="products-section">
            <h2 className="section-title">Dostępne produkty</h2>
            
            <ProductGrid 
              products={productsData} 
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              blur={false}
              cartDisabled={false}
            />
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default DropPage;