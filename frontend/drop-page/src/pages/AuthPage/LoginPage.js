import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import './AuthPage.css';

/**
 * Strona logowania
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // Stany
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pobranie URL do przekierowania po zalogowaniu
  const redirectUrl = new URLSearchParams(location.search).get('redirect') || 
                     localStorage.getItem('redirect_after_login') || 
                     '/drops';
  
  // Sprawdzenie, czy użytkownik jest już zalogowany
  useEffect(() => {
    if (isAuthenticated) {
      // Jeśli już zalogowany, przekieruj od razu
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);
  
  // Obsługa logowania
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Wywołanie funkcji logowania z kontekstu
      await login(email, password, rememberMe);
      
      // Usunięcie zapisanego URL przekierowania, jeśli istnieje
      localStorage.removeItem('redirect_after_login');
      
      // Przekierowanie po zalogowaniu
      navigate(redirectUrl);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Wystąpił błąd podczas logowania. Spróbuj ponownie.');
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <PageHeader />
      
      <main className="auth-content">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-container">
              <h1 className="auth-title">Zaloguj się</h1>
              
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}
              
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Hasło</label>
                  <input 
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Zapamiętaj mnie</span>
                  </label>
                  
                  <Link to="/auth/reset-password" className="forgot-password">
                    Zapomniałeś hasła?
                  </Link>
                </div>
                
                <button 
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Logowanie...' : 'Zaloguj się'}
                </button>
              </form>
              
              <div className="auth-separator">
                <span>lub</span>
              </div>
              
              <div className="social-login">
                <button className="social-button google">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                  <span>Zaloguj przez Google</span>
                </button>
                
                <button className="social-button facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Zaloguj przez Facebook</span>
                </button>
              </div>
              
              <div className="auth-redirect">
                Nie masz konta? <Link to="/auth/register">Zarejestruj się</Link>
              </div>
            </div>
            
            <div className="auth-info">
              <div className="auth-info-content">
                <h2>Witaj w Drop Commerce</h2>
                <p>Zaloguj się, aby uzyskać dostęp do ekskluzywnych dropów i limitowanych edycji.</p>
                
                <div className="auth-benefits">
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div className="benefit-text">
                      <h3>Szybki dostęp</h3>
                      <p>Bądź pierwszy w kolejce do najgorętszych dropów.</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <div className="benefit-text">
                      <h3>Bezpieczne płatności</h3>
                      <p>Zapisz swoje dane i płać szybciej przy kolejnych zakupach.</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                    </svg>
                    <div className="benefit-text">
                      <h3>Historia zamówień</h3>
                      <p>Śledź swoje zakupy i statusy dostawy w jednym miejscu.</p>
                    </div>
                  </div>
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

export default LoginPage;