import React from 'react';
import { Link } from 'react-router-dom';
import './PageFooter.css';

/**
 * Komponent stopki strony
 * Zawiera linki, informacje, copyright
 */
const PageFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="page-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Drop Commerce</h3>
            <p className="footer-description">
              Platforma z unikalnymi produktami dostępnymi tylko przez ograniczony czas.
              Odkryj limitowane kolekcje i wyjątkowe przedmioty.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Linki</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Strona główna</Link></li>
              <li><Link to="/drops" className="footer-link">Dropy</Link></li>
              <li><Link to="/about" className="footer-link">O nas</Link></li>
              <li><Link to="/contact" className="footer-link">Kontakt</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Wsparcie</h3>
            <ul className="footer-links">
              <li><Link to="/faq" className="footer-link">FAQ</Link></li>
              <li><Link to="/shipping" className="footer-link">Dostawa</Link></li>
              <li><Link to="/returns" className="footer-link">Zwroty</Link></li>
              <li><Link to="/help" className="footer-link">Centrum pomocy</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Kontakt</h3>
            <ul className="footer-contact-info">
              <li className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>+48 123 456 789</span>
              </li>
              <li className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>kontakt@dropcommerce.com</span>
              </li>
              <li className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>ul. Przykładowa 123, Warszawa</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Drop Commerce. Wszelkie prawa zastrzeżone.
          </div>
          
          <div className="footer-legal-links">
            <Link to="/privacy" className="footer-link">Polityka prywatności</Link>
            <Link to="/terms" className="footer-link">Regulamin</Link>
            <Link to="/cookies" className="footer-link">Polityka cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;