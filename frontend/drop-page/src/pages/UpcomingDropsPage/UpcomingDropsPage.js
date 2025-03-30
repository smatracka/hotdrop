import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import './UpcomingDropsPage.css';

const UpcomingDropsPage = () => {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulacja pobierania danych
    setTimeout(() => {
      setDrops([
        {
          id: '123',
          name: 'Ekskluzywna Kolekcja Limitowana 2025',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dni
          description: 'Wyjątkowe produkty w limitowanej edycji, dostępne tylko przez krótki czas.',
          image: 'collection-preview-1.jpg',
          productCount: 12
        },
        {
          id: '124',
          name: 'Letnia Kolekcja Streetwear',
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dni
          description: 'Najnowsze trendy streetwear na lato 2025. Limitowana seria!',
          image: 'collection-preview-2.jpg',
          productCount: 8
        },
        {
          id: '125',
          name: 'Edycja Specjalna: Współpraca z Artystami',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dni
          description: 'Unikalne wzory stworzone we współpracy z czołowymi artystami ulicznymi.',
          image: 'collection-preview-3.jpg',
          productCount: 15
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Format daty
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="upcoming-drops-page">
      <PageHeader />
      
      <main className="upcoming-drops-content">
        <div className="container">
          <h1 className="page-title">Nadchodzące Dropy</h1>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie nadchodzących dropów...</p>
            </div>
          ) : (
            <>
              <div className="drops-filter">
                <p>Wszystkie nadchodzące dropy ({drops.length})</p>
                <div className="filter-options">
                  <select className="filter-select">
                    <option>Sortuj wg daty</option>
                    <option>Sortuj wg nazwy</option>
                    <option>Sortuj wg ilości produktów</option>
                  </select>
                </div>
              </div>
              
              <div className="drops-grid">
                {drops.map(drop => (
                  <Link to={`/drops/${drop.id}`} key={drop.id} className="drop-card">
                    <div className="drop-image">
                      <div className="drop-image-placeholder"></div>
                    </div>
                    <div className="drop-info">
                      <h2 className="drop-name">{drop.name}</h2>
                      <p className="drop-date">Start: {formatDate(drop.startDate)}</p>
                      <p className="drop-description">{drop.description}</p>
                      <div className="drop-stats">
                        <span className="drop-product-count">{drop.productCount} produktów</span>
                      </div>
                      <button className="drop-details-button">Zobacz szczegóły</button>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          
          <div className="upcoming-info">
            <h2>Jak działają dropy?</h2>
            <p>
              Dropy to limitowane w czasie wyprzedaże ekskluzywnych produktów. Aby wziąć udział w dropie:
            </p>
            <ol>
              <li>Zarejestruj się i wpłać prepaid przed rozpoczęciem dropu</li>
              <li>Bądź gotowy o wyznaczonej godzinie startu</li>
              <li>Wybierz interesujące Cię produkty, zanim się wyprzedadzą</li>
              <li>Sfinalizuj zamówienie w ciągu 10 minut od dodania produktów do koszyka</li>
            </ol>
            <p>
              <Link to="/faq" className="info-link">Dowiedz się więcej w FAQ</Link>
            </p>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default UpcomingDropsPage;