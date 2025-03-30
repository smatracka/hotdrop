import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api/api';

// Utworzenie kontekstu autoryzacji
const AuthContext = createContext();

/**
 * Hook do użycia kontekstu autoryzacji
 * @returns {Object} Kontekst autoryzacji
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Provider kontekstu autoryzacji
 * Zarządza stanem autoryzacji i udostępnia metody logowania, rejestracji, wylogowania
 */
export const AuthProvider = ({ children }) => {
  // Stan autentykacji
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Sprawdzenie stanu autentykacji przy ładowaniu
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Weryfikacja tokenu
          const response = await api.get('/auth/verify');
          setCurrentUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token wygasł lub jest nieprawidłowy
          localStorage.removeItem('auth_token');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);
  
  /**
   * Logowanie użytkownika
   * @param {string} email - Email użytkownika
   * @param {string} password - Hasło użytkownika
   * @param {boolean} rememberMe - Czy zapamiętać użytkownika
   * @returns {Promise} Rezultat logowania
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe
      });
      
      const { token, user } = response.data.data;
      
      // Zapisanie tokenu
      localStorage.setItem('auth_token', token);
      
      // Aktualizacja stanu
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd logowania. Sprawdź dane i spróbuj ponownie.');
    }
  };
  
  /**
   * Rejestracja użytkownika
   * @param {Object} userData - Dane użytkownika
   * @returns {Promise} Rezultat rejestracji
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data.data;
      
      // Zapisanie tokenu
      localStorage.setItem('auth_token', token);
      
      // Aktualizacja stanu
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd rejestracji. Sprawdź dane i spróbuj ponownie.');
    }
  };
  
  /**
   * Wylogowanie użytkownika
   */
  const logout = async () => {
    try {
      // Wywołanie API wylogowania (jeśli potrzebne)
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Usunięcie tokenu i stanu użytkownika
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };
  
  /**
   * Aktualizacja danych użytkownika
   * @param {Object} userData - Nowe dane użytkownika
   * @returns {Promise} Zaktualizowany użytkownik
   */
  const updateUser = async (userData) => {
    try {
      const response = await api.patch('/auth/profile', userData);
      
      const updatedUser = response.data.data.user;
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji profilu.');
    }
  };
  
  /**
   * Reset hasła użytkownika
   * @param {string} email - Email użytkownika
   * @returns {Promise} Rezultat żądania resetu
   */
  const resetPassword = async (email) => {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd żądania resetu hasła.');
    }
  };
  
  /**
   * Mockowane dane dla środowiska deweloperskiego
   */
  const mockAuth = () => {
    // W trybie developmentu - mockowane dane i autentykacja
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        id: 'user123',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@example.com',
        role: 'user'
      };
      
      setCurrentUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth_token', 'mock-token-123');
    }
  };
  
  // Wartość kontekstu
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    mockAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;