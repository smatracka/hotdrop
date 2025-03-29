// frontend/seller-panel/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

// Utworzenie kontekstu
const AuthContext = createContext();

// Hook do użycia kontekstu
export const useAuth = () => useContext(AuthContext);

// Provider kontekstu
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Przy pierwszym renderowaniu sprawdź, czy użytkownik jest zalogowany
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // W trybie rozwojowym, możemy po prostu ustawić użytkownika testowego
          // zamiast robić wywołanie API
          const testUser = {
            id: '123456',
            name: 'Testowy Użytkownik',
            email: 'test@example.com',
            company: {
              name: 'Testowa Firma',
              vatId: '1234567890',
              address: {
                street: 'ul. Testowa 1',
                city: 'Warszawa',
                postalCode: '00-001',
                country: 'Polska'
              }
            }
          };
          
          setUser(testUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check error:', error);
          // W przypadku błędu, wyloguj
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Logowanie
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Zamiast faktycznego wywołania API, po prostu symuluj pomyślne logowanie
      // Możesz ustawić dowolne dane testowe dla użytkownika
      const user = {
        id: '123456',
        name: 'Testowy Użytkownik',
        email: email,
        company: {
          name: 'Testowa Firma',
          vatId: '1234567890',
          address: {
            street: 'ul. Testowa 1',
            city: 'Warszawa',
            postalCode: '00-001',
            country: 'Polska'
          }
        }
      };
      
      // Zapisz fikcyjny token w localStorage
      localStorage.setItem('token', 'test-token-123456');
      
      // Ustaw token w nagłówkach żądań
      api.defaults.headers.common['Authorization'] = `Bearer test-token-123456`;
      
      // Zaktualizuj stan
      setToken('test-token-123456');
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Zalogowano pomyślnie');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Błąd logowania';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Rejestracja
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Symulacja udanej rejestracji
      toast.success('Rejestracja zakończona pomyślnie. Możesz się teraz zalogować.');
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Błąd rejestracji';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Wylogowanie
  const logout = () => {
    // Usuń token z localStorage
    localStorage.removeItem('token');
    
    // Usuń token z nagłówków żądań
    delete api.defaults.headers.common['Authorization'];
    
    // Zresetuj stan
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('Wylogowano pomyślnie');
  };

  // Resetowanie hasła
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      
      // Symulacja udanego resetowania
      toast.success('Instrukcje resetowania hasła zostały wysłane na podany adres e-mail');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || 'Błąd resetowania hasła';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Aktualizacja danych użytkownika
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      // Symulacja udanej aktualizacji
      setUser({...user, ...userData});
      toast.success('Profil zaktualizowany pomyślnie');
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.message || 'Błąd aktualizacji profilu';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Zmiana hasła
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      
      // Symulacja udanej zmiany hasła
      toast.success('Hasło zmienione pomyślnie');
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      const message = error.response?.data?.message || 'Błąd zmiany hasła';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Wartości udostępniane przez kontekst
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;