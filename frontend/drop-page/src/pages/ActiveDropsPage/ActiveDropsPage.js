import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import './ActiveDropsPage.css';

const ActiveDropsPage = () => {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulacja pobierania danych
    setTimeout(() => {
      setDrops([
        {
          id: '121',
          name: 'Kolekcja Designer Streetwear 2025',
          startDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 godzin temu
          endDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 godzin w przód
          description: 'Luksusowe streetwear z limitowanej kolekcji. Tylko dziś!',
          image: 'active-drop-1.jpg',
          productCount: 15,
          soldProductCount: 8,
          participantsCount: 230
        },
        {
          id: '122',
          name: 'Limitowana Edycja Sneakers',
          startDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 godziny temu
          endDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 godzin w przód
          description: 'Ekskluzywne sneakersy w tylko 100 egzemplarzach.',
          image: 'active-drop-2.jpg',
          productCount: 10,
          soldProductCount: 3,
          participantsCount: 157
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

  // Obliczanie czasu do końca dropu
  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="active-drops-page">
      <PageHeader />
      
      <main className="active-drops-content">
        <div className="container">
          <h1 className="page-title">Aktywne Dropy</h1>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie aktywnych dropów...</p>
            </div>
          ) : (
            <>
              <div className="drops-filter">
                <p>Aktywne dropy ({drops.length})</p>
                <div className="filter-options">
                  <select className="filter-select">
                    <option>Sortuj wg końca dropu</option>
                    <option>Sortuj wg popularności</option>
                    <option>Sortuj wg dostępności</option>
                  </select>
                </div>
              </div>
              
              {drops.length > 0 ? (
                <div className="active-drops-grid">
                  {drops.map(drop => (
                    <div key={drop.id} className="active-drop-card">
                      <div className="drop-image">
                        <div className="drop-image-placeholder"></div>
                        <div className="drop-live-badge">LIVE</div>
                      </div>
                      <div className="drop-info">
                        <h2 className="drop-name">{drop.name}</h2>
                        <div className="drop-time-info">
                          <div className="drop-time-remaining">
                            <span className="time-label">Kończy się za:</span>
                            <span className="time-value">{getTimeRemaining(drop.endDate)}</span>
                          </div>
                        </div>
                        <p className="drop-description">{drop.description}</p>
                        <div className="drop-stats-row">
                          <div className="drop-stat">
                            <span className="stat-value">{drop.productCount - drop.soldProductCount}/{drop.productCount}</span>
                            <span className="stat-label">Dostępnych</span>
                          </div>
                          <div className="drop-stat">
                            <span className="stat-value">{drop.soldProductCount}</span>
                            <span className="stat-label">Sprzedanych</span>
                          </div>
                          <div className="drop-stat">
                            <span className="stat-value">{drop.participantsCount}</span>
                            <span className="stat-label">Uczestników</span>
                          </div>
                        </div>
                        <div className="availability-bar">
                          <div 
                            className="availability-progress" 
                            style={{ width: `${(drop.soldProductCount / drop.productCount) * 100}%` }}
                          ></div>
                        </div>
                        <Link to={`/drops/${drop.id}/active`} className="join-drop-button">
                          Dołącz do dropu
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-drops-container">
                  <div className="no-drops-icon">⏰</div>
                  <h2>Brak aktywnych dropów</h2>
                  <p>Obecnie nie ma żadnych aktywnych dropów. Sprawdź nadchodzące wydarzenia!</p>
                  <Link to="/drops/upcoming" className="view-upcoming-button">
                    Zobacz nadchodzące dropy
                  </Link>
                </div>
              )}
            </>
          )}
          
          <div className="active-drops-info">
            <h2>Jak wziąć udział w aktywnym dropie?</h2>
            <ol>
              <li>Kliknij "Dołącz do dropu" aby przejść do strony dropu</li>
              <li>Jeśli drop jest popularny, możesz zostać umieszczony w kolejce</li>
              <li>Po wejściu na stronę dropu masz 10 minut na zakupy</li>
              <li>Dodaj produkty do koszyka i przejdź do płatności przed upływem czasu</li>
            </ol>
            <p>
              <strong>Uwaga:</strong> Produkty w koszyku są zarezerwowane tylko na czas trwania Twojej sesji zakupowej!
            </p>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default ActiveDropsPage;