import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CountdownTimer from '../../components/drop/CountdownTimer';
import ProductGrid from '../../components/drop/ProductGrid';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import Button from '../../components/common/Button';
import { fetchDropDetails } from '../../services/api/dropService';
import './LandingPage.css';

/**
 * Strona landingowa dropu przed jego rozpoczęciem
 * Wyświetla odliczanie, podgląd produktów i przycisk "Weź udział w dropie"
 */
const LandingPage = () => {
  const { dropId } = useParams();
  const navigate = useNavigate();
  const [dropData, setDropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobieranie danych o dropie
  useEffect(() => {
    const loadDropData = async () => {
      try {
        setLoading(true);
        const data = await fetchDropDetails(dropId);
        setDropData(data);
        setLoading(false);
        
        // Sprawdzenie czy drop jest aktywny i przekierowanie jeśli tak
        if (data.isActive) {
          navigate(`/drops/${dropId}/active`);
        }
      } catch (err) {
        console.error('Error loading drop data:', err);
        setError('Nie udało się załadować danych dropu. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    loadDropData();
  }, [dropId, navigate]);

  // Obsługa przycisku "Weź udział w dropie"
  const handleJoinDrop = () => {
    // Sprawdzenie czy użytkownik jest zalogowany
    const isLoggedIn = localStorage.getItem('auth_token');
    
    if (isLoggedIn) {
      // Przekierowanie do prepaidu/checkout
      navigate(`/drops/${dropId}/prepaid`);
    } else {
      // Zapisanie URL docelowego do przekierowania po logowaniu
      localStorage.setItem('redirect_after_login', `/drops/${dropId}/prepaid`);
      // Przekierowanie do logowania
      navigate('/auth/login');
    }
  };

  // Obsługa zakończenia odliczania
  const handleCountdownComplete = () => {
    // Odświeżenie danych dropu po zakończeniu odliczania
    window.location.reload();
  };

  // Zawartość podczas ładowania
  if (loading) {
    return (
      <div className="landing-page">
        <PageHeader />
        <main className="landing-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie informacji o dropie...</p>
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
      <div className="landing-page">
        <PageHeader />
        <main className="landing-content">
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

  // Sprawdzenie czy dane są dostępne
  if (!dropData) {
    return (
      <div className="landing-page">
        <PageHeader />
        <main className="landing-content">
          <div className="container">
            <div className="not-found-container">
              <h2>Drop nie został znaleziony</h2>
              <p>Podany drop nie istnieje lub został usunięty.</p>
              <Button variant="primary" onClick={() => navigate('/')}>
                Powrót do strony głównej
              </Button>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="landing-page">
      <PageHeader />
      
      <main className="landing-content">
        <div className="container">
          <h1 className="landing-title">{dropData.name}</h1>
          
          <div className="countdown-section">
            <h2>Drop rozpocznie się za:</h2>
            <CountdownTimer 
              targetDate={dropData.startDate} 
              onComplete={handleCountdownComplete}
              size="large"
            />
            
            <Button 
              variant="primary" 
              size="large" 
              onClick={handleJoinDrop}
              className="join-button"
            >
              Weź udział w dropie
            </Button>
          </div>
          
          <div className="landing-description">
            <p>{dropData.description}</p>
          </div>
          
          <div className="product-preview-section">
            <div className="section-header">
              <h2>Podgląd dostępnych produktów</h2>
              {dropData.showProductCount && (
                <p className="product-count">Dostępnych produktów: {dropData.productCount}</p>
              )}
            </div>
            
            <ProductGrid 
              products={dropData.products} 
              blur={true}
              cartDisabled={true}
            />
          </div>
          
          <div className="cta-section">
            <h2>Nie przegap tego dropu!</h2>
            <p>Przygotuj się na wyjątkowe produkty dostępne tylko przez ograniczony czas.</p>
            <Button 
              variant="primary" 
              size="large" 
              onClick={handleJoinDrop}
              className="join-button"
            >
              Weź udział w dropie
            </Button>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default LandingPage;