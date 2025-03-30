import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import { fetchDropDetails } from '../../services/api/dropService';
import { fetchOrder } from '../../services/api/orderService';
import './ThankYouPage.css';

/**
 * Strona podziękowań po zakupie
 * Wyświetla potwierdzenie zamówienia i szczegóły
 */
const ThankYouPage = () => {
  const { dropId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Stany
  const [dropData, setDropData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pobieranie danych z location state (przekazane z poprzedniej strony)
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount;
  
  // Pobieranie danych
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Pobierz dane dropu
        const drop = await fetchDropDetails(dropId);
        setDropData(drop);
        
        // Jeśli mamy ID zamówienia, pobierz szczegóły
        if (orderId) {
          const order = await fetchOrder(orderId);
          setOrderData(order);
        } else {
          // Jeśli nie ma ID zamówienia w state, spróbuj odtworzyć z danych lokalnych
          // W rzeczywistej implementacji można by pobierać ostatnie zamówienie użytkownika
          setOrderData({
            id: 'ORDER-' + Math.floor(Math.random() * 10000),
            date: new Date().toISOString(),
            totalAmount: totalAmount || 0,
            status: 'processing',
            estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'prepaid'
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching thank you page data:', err);
        setError(err.message || 'Nie udało się załadować danych zamówienia.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dropId, orderId, totalAmount]);
  
  // Obsługa powrotu do listy dropów
  const handleBackToDrops = () => {
    navigate('/drops');
  };
  
  // Zawartość podczas ładowania
  if (loading) {
    return (
      <div className="thank-you-page">
        <PageHeader />
        <main className="thank-you-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie szczegółów zamówienia...</p>
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
      <div className="thank-you-page">
        <PageHeader />
        <main className="thank-you-content">
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
              <button className="btn btn-primary" onClick={handleBackToDrops}>
                Przejdź do listy dropów
              </button>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="thank-you-page">
      <PageHeader />
      
      <main className="thank-you-content">
        <div className="container">
          <div className="thank-you-container">
            <div className="thank-you-header">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              
              <h1 className="thank-you-title">Dziękujemy za zakup!</h1>
              <p className="thank-you-subtitle">
                Twoje zamówienie zostało przyjęte i jest przetwarzane.
              </p>
            </div>
            
            <div className="order-details-section">
              <h2 className="section-title">Szczegóły zamówienia</h2>
              
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Numer zamówienia:</span>
                  <span className="detail-value">{orderData.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Data zamówienia:</span>
                  <span className="detail-value">{formatDate(orderData.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Wartość zamówienia:</span>
                  <span className="detail-value">{orderData.totalAmount.toFixed(2)} zł</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-processing">Przetwarzanie</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Przewidywana dostawa:</span>
                  <span className="detail-value">{formatDate(orderData.estimatedDeliveryDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Metoda płatności:</span>
                  <span className="detail-value">Prepaid</span>
                </div>
              </div>
            </div>
            
            <div className="order-message">
              <p>Potwierdzenie zamówienia zostało wysłane na Twój adres email. Będziemy informować Cię o statusie zamówienia.</p>
              <p>Dziękujemy za zakupy w <strong>Drop Commerce</strong>!</p>
            </div>
            
            <div className="actions-section">
              <button className="primary-button" onClick={handleBackToDrops}>
                Przeglądaj więcej dropów
              </button>
              
              <div className="secondary-actions">
                <a href="/account/orders" className="secondary-link">Sprawdź swoje zamówienia</a>
                <a href={`/drops/${dropId}`} className="secondary-link">Wróć do dropu</a>
              </div>
            </div>
            
            <div className="promotion-section">
              <h2 className="section-title">Nadchodzące dropy</h2>
              
              <div className="upcoming-drops">
                <p>Śledź nasze nadchodzące dropy, aby nie przegapić limitowanych edycji!</p>
                <a href="/drops/upcoming" className="upcoming-drops-link">
                  Zobacz nadchodzące dropy
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default ThankYouPage;