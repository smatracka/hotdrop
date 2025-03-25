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
          // Ustaw token w nagłówkach żądań
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Pobierz dane użytkownika
          const response = await api.get('/users/me');
          
          if (response.data && response.data.success) {
            setUser(response.data.data);
            setIsAuthenticated(true);
          } else {
            // Jeśli odpowiedź nie zawiera danych użytkownika, wyloguj
            logout();
          }
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
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.success) {
        const { token, user } = response.data.data;
        
        // Zapisz token w localStorage
        localStorage.setItem('token', token);
        
        // Ustaw token w nagłówkach żądań
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Zaktualizuj stan
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Zalogowano pomyślnie');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Błąd logowania');
        return { success: false, message: response.data.message };
      }
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
      const response = await api.post('/auth/register', userData);
      
      if (response.data && response.data.success) {
        toast.success('Rejestracja zakończona pomyślnie. Możesz się teraz zalogować.');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Błąd rejestracji');
        return { success: false, message: response.data.message };
      }
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
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data && response.data.success) {
        toast.success('Instrukcje resetowania hasła zostały wysłane na podany adres e-mail');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Błąd resetowania hasła');
        return { success: false, message: response.data.message };
      }
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
      const response = await api.put('/users/profile', userData);
      
      if (response.data && response.data.success) {
        setUser(response.data.data);
        toast.success('Profil zaktualizowany pomyślnie');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Błąd aktualizacji profilu');
        return { success: false, message: response.data.message };
      }
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
      const response = await api.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      if (response.data && response.data.success) {
        toast.success('Hasło zmienione pomyślnie');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Błąd zmiany hasła');
        return { success: false, message: response.data.message };
      }
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
