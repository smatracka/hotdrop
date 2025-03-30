import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import { fetchDropDetails } from '../../services/api/dropService';
import { getCart, checkCartAvailability } from '../../services/api/cartService';
import { processPayment } from '../../services/api/paymentService';
import './CheckoutPage.css';

/**
 * Strona finalizacji zamówienia
 * Zawiera podsumowanie koszyka i płatność z wpłaconego wcześniej prepaidu
 */
const CheckoutPage = () => {
  const { dropId } = useParams();
  const navigate = useNavigate();
  
  // Stany
  const [dropData, setDropData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [prepaidData, setPrepaidData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Pobieranie danych
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Pobierz dane dropu
        const drop = await fetchDropDetails(dropId);
        setDropData(drop);
        
        // Pobierz dane koszyka
        const cart = await getCart(dropId);
        setCartData(cart);
        
        // Pobierz dane o wpłaconym prepaidzie (w rzeczywistej implementacji z API)
        // To jest mockowane dane, w prawdziwej implementacji pobierane z API
        setPrepaidData({
          amount: 1500.00,
          paymentMethod: 'card',
          paymentDate: new Date().toISOString(),
          cardLastFour: '4242'
        });
        
        // Sprawdź dostępność produktów
        await checkCartAvailability(dropId);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError(err.message || 'Nie udało się załadować danych zamówienia.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dropId]);
  
  // Obsługa potwierdzenia zakupu
  const handleConfirmOrder = async () => {
    try {
      setProcessing(true);
      
      // Wywołanie API do przetworzenia zamówienia
      const result = await processPayment(dropId, {
        paymentMethod: 'prepaid', // Płatność z prepaidu
        items: cartData.items,
        totalAmount: cartData.total
      });
      
      if (result.success) {
        // Przekieruj do strony podziękowania
        navigate(`/drops/${dropId}/thank-you`, { 
          state: { 
            orderId: result.orderId,
            totalAmount: cartData.total
          }
        });
      } else {
        setError(result.error || 'Wystąpił błąd podczas przetwarzania zamówienia.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Error processing order:', err);
      setError(err.message || 'Wystąpił błąd podczas przetwarzania zamówienia.');
      setProcessing(false);
    }
  };
  
  // Zawartość podczas ładowania
  if (loading) {
    return (
      <div className="checkout-page">
        <PageHeader />
        <main className="checkout-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie danych zamówienia...</p>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }
  
  // Obsługa błędów
  if (error) {
    return (
      <div className="checkout-page">
        <PageHeader />
        <main className="checkout-content">
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
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }
  
  // Sprawdzenie danych
  if (!cartData || !prepaidData || !dropData) {
    return (
      <div className="checkout-page">
        <PageHeader />
        <main className="checkout-content">
          <div className="container">
            <div className="not-found-container">
              <h2>Brak danych zamówienia</h2>
              <p>Nie znaleziono danych koszyka lub wpłaconego prepaidu.</p>
              <button className="btn btn-primary" onClick={() => navigate(`/drops/${dropId}`)}>
                Powrót do strony dropu
              </button>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }
  
  // Sprawdzenie, czy wpłacony prepaid pokrywa koszt zamówienia
  const hasEnoughFunds = prepaidData.amount >= cartData.total;
  
  return (
    <div className="checkout-page">
      <PageHeader />
      
      <main className="checkout-content">
        <div className="container">
          <h1 className="checkout-title">Potwierdzenie zamówienia - {dropData.name}</h1>
          
          <div className="checkout-grid">
            <div className="checkout-summary">
              <div className="checkout-section">
                <h2 className="section-title">Podsumowanie zamówienia</h2>
                
                <div className="cart-items">
                  {Object.entries(cartData.items).map(([productId, quantity]) => {
                    const product = dropData.products.find(p => p.id === productId);
                    return product ? (
                      <div key={productId} className="cart-item">
                        <div className="cart-item-image">
                          <img 
                            src={`https://storage.googleapis.com/drop-commerce-static/assets/images/${product.imageName}-sm.webp`}
                            alt={product.name}
                          />
                        </div>
                        <div className="cart-item-details">
                          <div className="cart-item-name">{product.name}</div>
                          <div className="cart-item-price">{product.price.toFixed(2)} zł × {quantity}</div>
                        </div>
                        <div className="cart-item-total">
                          {(product.price * quantity).toFixed(2)} zł
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                
                <div className="order-totals">
                  <div className="order-total-row">
                    <span>Wartość produktów:</span>
                    <span>{cartData.total.toFixed(2)} zł</span>
                  </div>
                  <div className="order-total-row">
                    <span>Dostawa:</span>
                    <span>0.00 zł</span>
                  </div>
                  <div className="order-total-row order-total-sum">
                    <span>Łącznie do zapłaty:</span>
                    <span>{cartData.total.toFixed(2)} zł</span>
                  </div>
                </div>
              </div>
              
              <div className="checkout-section">
                <h2 className="section-title">Twój wpłacony prepaid</h2>
                
                <div className="prepaid-info">
                  <div className="prepaid-amount">
                    <span>Dostępne środki:</span>
                    <span className="amount">{prepaidData.amount.toFixed(2)} zł</span>
                  </div>
                  
                  <div className="prepaid-details">
                    <div className="prepaid-method">
                      <span>Metoda płatności:</span>
                      <span>{prepaidData.paymentMethod === 'card' ? 'Karta płatnicza' : 'Przelew'}</span>
                    </div>
                    {prepaidData.cardLastFour && (
                      <div className="prepaid-card">
                        <span>Karta:</span>
                        <span>•••• {prepaidData.cardLastFour}</span>
                      </div>
                    )}
                    <div className="prepaid-date">
                      <span>Data wpłaty:</span>
                      <span>{new Date(prepaidData.paymentDate).toLocaleDateString('pl-PL')}</span>
                    </div>
                  </div>
                </div>
                
                {hasEnoughFunds ? (
                  <div className="funds-status funds-ok">
                    Wpłacone środki pokrywają koszt zamówienia
                  </div>
                ) : (
                  <div className="funds-status funds-not-enough">
                    Brakuje {(cartData.total - prepaidData.amount).toFixed(2)} zł
                  </div>
                )}
              </div>
            </div>
            
            <div className="checkout-sidebar">
              <div className="checkout-section">
                <h2 className="section-title">Dane dostawy</h2>
                
                <div className="shipping-address">
                  <p>Jan Kowalski</p>
                  <p>ul. Przykładowa 123</p>
                  <p>00-001 Warszawa</p>
                  <p>Polska</p>
                  <p>Tel: +48 123 456 789</p>
                </div>
                
                <a href="#" className="edit-link">Edytuj dane dostawy</a>
              </div>
              
              <div className="checkout-section">
                <h2 className="section-title">Podsumowanie</h2>
                
                <div className="final-summary">
                  <div className="summary-row">
                    <span>Liczba produktów:</span>
                    <span>{Object.values(cartData.items).reduce((sum, qty) => sum + qty, 0)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Wartość zamówienia:</span>
                    <span>{cartData.total.toFixed(2)} zł</span>
                  </div>
                  <div className="summary-row">
                    <span>Środki po zakupie:</span>
                    <span>{(prepaidData.amount - cartData.total).toFixed(2)} zł</span>
                  </div>
                </div>
                
                <button 
                  className="confirm-order-button"
                  onClick={handleConfirmOrder}
                  disabled={processing || !hasEnoughFunds}
                >
                  {processing ? 'Przetwarzanie...' : 'Zatwierdź i zapłać'}
                </button>
                
                {!hasEnoughFunds && (
                  <div className="not-enough-funds-warning">
                    Brak wystarczających środków do złożenia zamówienia
                  </div>
                )}
                
                <div className="back-to-cart">
                  <button 
                    className="back-button"
                    onClick={() => navigate(`/drops/${dropId}/active`)}
                    disabled={processing}
                  >
                    Wróć do dropu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default CheckoutPage;