import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import './NotFoundPage.css';

/**
 * Strona 404 - Not Found
 */
const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <PageHeader />
      
      <main className="not-found-content">
        <div className="container">
          <div className="not-found-container">
            <div className="error-code">404</div>
            
            <h1 className="not-found-title">Strona nie została znaleziona</h1>
            
            <p className="not-found-message">
              Przepraszamy, strona której szukasz nie istnieje lub została przeniesiona.
            </p>
            
            <div className="not-found-actions">
              <Link to="/" className="primary-button">
                Wróć na stronę główną
              </Link>
              
              <div className="secondary-actions">
                <Link to="/drops" className="secondary-link">
                  Przeglądaj dropy
                </Link>
                <Link to="/contact" className="secondary-link">
                  Skontaktuj się z nami
                </Link>
              </div>
            </div>
            
            <div className="not-found-suggestions">
              <h2>Możesz również:</h2>
              <ul>
                <li>Sprawdzić, czy adres URL został wpisany poprawnie</li>
                <li>Wrócić do poprzedniej strony</li>
                <li>Skorzystać z wyszukiwarki na stronie głównej</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default NotFoundPage;