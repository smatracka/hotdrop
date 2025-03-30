import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import './PastDropsPage.css';

const PastDropsPage = () => {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Symulacja pobierania danych
    setTimeout(() => {
      const pastDrops = [
        {
          id: '120',
          name: 'Jesień 2024 Limited Collection',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dni temu
          endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dni temu
          description: 'Jesienna kolekcja inspirowana kolorami natury.',
          image: 'past-drop-1.jpg',
          productCount: 18,
          soldProductCount: 18,
          soldOutTime: '45 minut',
          participantsCount: 320
        },
        {
          id: '119',
          name: 'Summer Essentials 2024',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dni temu
          endDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(), // 29 dni temu
          description: 'Niezbędniki na lato 2024 w limitowanej edycji.',
          image: 'past-drop-2.jpg',
          productCount: 12,
          soldProductCount: 9,
          soldOutTime: '3 godziny',
          participantsCount: 165
        },
        {
          id: '118',
          name: 'Tech Accessories Collection',
          startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dni temu
          endDate: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(), // 44 dni temu
          description: 'Akcesoria tech w wyjątkowym designie.',
          image: 'past-drop-3.jpg',
          productCount: 10,
          soldProductCount: 6,
          soldOutTime: 'nie wyprzedano',
          participantsCount: 89
        },
        {
          id: '117',
          name: 'Spring Collection 2024',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dni temu
          endDate: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(), // 59 dni temu
          description: 'Wiosenne inspiracje w pastelowych kolorach.',
          image: 'past-drop-4.jpg',
          productCount: 15,
          soldProductCount: 15,
          soldOutTime: '2 godziny',
          participantsCount: 210
        }
      ];
      
      setDrops(pastDrops);
      setTotalPages(3); // Symulujemy 3 strony wyników
      setLoading(false);
    }, 1000);
  }, [currentPage]);

  // Format daty
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obsługa zmiany strony
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setLoading(true);
      // W rzeczywistej aplikacji tutaj pobralibyśmy dane dla nowej strony
    }
  };

  return (
    <div className="past-drops-page">
      <PageHeader />
      
      <main className="past-drops-content">
        <div className="container">
          <h1 className="page-title">Zakończone Dropy</h1>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie zakończonych dropów...</p>
            </div>
          ) : (
            <>
              <div className="drops-filter">
                <p>Zakończone dropy (strona {currentPage} z {totalPages})</p>
                <div className="filter-options">
                  <select className="filter-select">
                    <option>Sortuj od najnowszych</option>
                    <option>Sortuj od najstarszych</option>
                    <option>Sortuj wg popularności</option>
                  </select>
                </div>
              </div>
              
              <div className="past-drops-grid">
                {drops.map(drop => (
                  <div key={drop.id} className="past-drop-card">
                    <div className="drop-image">
                      <div className="drop-image-placeholder"></div>
                      <div className="drop-ended-badge">ZAKOŃCZONY</div>
                    </div>
                    <div className="drop-info">
                      <h2 className="drop-name">{drop.name}</h2>
                      <div className="drop-date-info">
                        <span className="date-label">Data dropu:</span>
                        <span className="date-value">{formatDate(drop.startDate)}</span>
                      </div>
                      <p className="drop-description">{drop.description}</p>
                      <div className="drop-stats-grid">
                        <div className="past-drop-stat">
                          <div className="stat-name">Produkty:</div>
                          <div className="stat-value">{drop.soldProductCount}/{drop.productCount}</div>
                        </div>
                        <div className="past-drop-stat">
                          <div className="stat-name">Wyprzedano w:</div>
                          <div className="stat-value">{drop.soldOutTime}</div>
                        </div>
                        <div className="past-drop-stat">
                          <div className="stat-name">Uczestników:</div>
                          <div className="stat-value">{drop.participantsCount}</div>
                        </div>
                        <div className="past-drop-stat">
                          <div className="stat-name">Sprzedaż:</div>
                          <div className="stat-value">
                            {Math.round((drop.soldProductCount / drop.productCount) * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="availability-bar past-drop">
                        <div 
                          className="availability-progress"
                          style={{ width: `${(drop.soldProductCount / drop.productCount) * 100}%` }}
                        ></div>
                      </div>
                      <Link to={`/drops/${drop.id}/summary`} className="view-drop-summary-button">
                        Zobacz podsumowanie
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginacja */}
              <div className="pagination">
                <button 
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Poprzednia
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`pagination-page ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Następna
                </button>
              </div>
            </>
          )}
          
          <div className="past-drops-info">
            <h2>Dlaczego dropy są czasowe?</h2>
            <p>
              Nasze dropy to wyjątkowe, limitowane w czasie wydarzenia zakupowe. Każdy drop trwa 24 godziny lub do wyczerpania zapasów. 
              Ta formuła pozwala nam:
            </p>
            <ul>
              <li>Oferować produkty w naprawdę limitowanych ilościach</li>
              <li>Zapewniać unikalne kolekcje, które się nie powtarzają</li>
              <li>Tworzyć ekscytujące doświadczenie zakupowe</li>
              <li>Docierać do prawdziwych entuzjastów i kolekcjonerów</li>
            </ul>
            <p>
              <Link to="/drops/upcoming" className="info-link">Sprawdź nadchodzące dropy</Link> i nie przegap kolejnych wyjątkowych okazji!
            </p>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default PastDropsPage;