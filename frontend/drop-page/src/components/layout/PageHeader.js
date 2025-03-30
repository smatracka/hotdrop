import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './PageHeader.css';

/**
 * Komponent nagłówka strony
 * Zawiera logo, nawigację i koszyk
 */
const PageHeader = ({ cartItemsCount = 0 }) => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('auth_token') !== null;
  
  // Obsługa wylogowania
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/');
  };
  
  return (
    <header className="page-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Drop Commerce
          </Link>
          
          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">Strona główna</Link>
              </li>
              <li className="nav-item">
                <Link to="/drops" className="nav-link">Dropy</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link">O nas</Link>
              </li>
            </ul>
          </nav>
          
          <div className="header-actions">
            {isLoggedIn ? (
              <>
                {cartItemsCount > 0 && (
                  <Link to="/cart" className="cart-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span className="cart-count">{cartItemsCount}</span>
                  </Link>
                )}
                
                <div className="user-menu">
                  <button className="user-menu-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>
                  
                  <div className="user-dropdown">
                    <Link to="/account" className="dropdown-item">Moje konto</Link>
                    <Link to="/orders" className="dropdown-item">Moje zamówienia</Link>
                    <button className="dropdown-item logout-button" onClick={handleLogout}>
                      Wyloguj się
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/auth/login" className="login-button">
                  Zaloguj się
                </Link>
                <Link to="/auth/register" className="register-button">
                  Zarejestruj się
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  cartItemsCount: PropTypes.number
};

export default PageHeader;