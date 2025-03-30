import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import './AuthPage.css';

/**
 * Strona rejestracji
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  
  // Stany
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
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
  
  // Obsługa zmiany wartości pól formularza
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Sprawdzenie siły hasła
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  // Sprawdzenie siły hasła
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Jeśli puste hasło, siła = 0
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }
    
    // Dodaj siłę za długość
    if (password.length >= 8) {
      strength += 1;
    }
    
    // Dodaj siłę za małe i duże litery
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      strength += 1;
    }
    
    // Dodaj siłę za liczby
    if (password.match(/([0-9])/)) {
      strength += 1;
    }
    
    // Dodaj siłę za znaki specjalne
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
      strength += 1;
    }
    
    setPasswordStrength(strength);
  };
  
  // Walidacja formularza
  const validateForm = () => {
    // Sprawdzenie, czy pola są wypełnione
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Wszystkie pola są wymagane.');
      return false;
    }
    
    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Podaj prawidłowy adres email.');
      return false;
    }
    
    // Walidacja hasła
    if (formData.password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków.');
      return false;
    }
    
    // Sprawdzenie, czy hasła są zgodne
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są zgodne.');
      return false;
    }
    
    // Sprawdzenie akceptacji regulaminu
    if (!acceptTerms) {
      setError('Musisz zaakceptować regulamin.');
      return false;
    }
    
    return true;
  };
  
  // Obsługa rejestracji
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Walidacja formularza
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Wywołanie funkcji rejestracji z kontekstu
      await register(formData);
      
      // Usunięcie zapisanego URL przekierowania, jeśli istnieje
      localStorage.removeItem('redirect_after_login');
      
      // Przekierowanie po rejestracji
      navigate(redirectUrl);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
      setLoading(false);
    }
  };
  
  // Renderowanie paska siły hasła
  const renderPasswordStrengthBar = () => {
    const strengthClass = [
      'strength-none',
      'strength-weak',
      'strength-medium',
      'strength-good',
      'strength-strong'
    ][passwordStrength];
    
    const strengthText = [
      '',
      'Słabe',
      'Średnie',
      'Dobre',
      'Silne'
    ][passwordStrength];
    
    return (
      <div className="password-strength">
        <div className="strength-bar">
          <div className={`strength-indicator ${strengthClass}`} style={{ width: `${passwordStrength * 25}%` }}></div>
        </div>
        <div className="strength-text">{strengthText}</div>
      </div>
    );
  };
  
  return (
    <div className="auth-page">
      <PageHeader />
      
      <main className="auth-content">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-container">
              <h1 className="auth-title">Zarejestruj się</h1>
              
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}
              
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Imię</label>
                    <input 
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Nazwisko</label>
                    <input 
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Hasło</label>
                  <input 
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                  />
                  {formData.password && renderPasswordStrengthBar()}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Powtórz hasło</label>
                  <input 
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-options">
                  <label className="accept-terms">
                    <input 
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                    />
                    <span>Akceptuję <a href="/terms" target="_blank">regulamin</a> i <a href="/privacy" target="_blank">politykę prywatności</a></span>
                  </label>
                </div>
                
                <button 
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Rejestracja...' : 'Zarejestruj się'}
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
                  <span>Zarejestruj przez Google</span>
                </button>
                
                <button className="social-button facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Zarejestruj przez Facebook</span>
                </button>
              </div>
              
              <div className="auth-redirect">
                Masz już konto? <Link to="/auth/login">Zaloguj się</Link>
              </div>
            </div>
            
            <div className="auth-info">
              <div className="auth-info-content">
                <h2>Dołącz do Drop Commerce</h2>
                <p>Załóż konto i uzyskaj dostęp do ekskluzywnych dropów i limitowanych edycji.</p>
                
                <div className="auth-benefits">
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div className="benefit-text">
                      <h3>Spersonalizowane powiadomienia</h3>
                      <p>Otrzymuj informacje o nadchodzących dropach dopasowanych do Twoich preferencji.</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <div className="benefit-text">
                      <h3>Śledzenie zamówień</h3>
                      <p>Monitoruj status swoich zamówień w czasie rzeczywistym.</p>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <div className="benefit-text">
                      <h3>Dostęp do ofert specjalnych</h3>
                      <p>Korzystaj z ekskluzywnych promocji i wcześniejszego dostępu do wybranych dropów.</p>
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

export default RegisterPage;