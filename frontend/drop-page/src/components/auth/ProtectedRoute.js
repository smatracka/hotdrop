import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Komponent chronionej ścieżki
 * Przekierowuje na stronę logowania, jeśli użytkownik nie jest zalogowany
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Jeśli trwa ładowanie stanu autentykacji, pokazujemy loader
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Ładowanie...</p>
      </div>
    );
  }
  
  // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
  // z informacją o docelowym URL
  if (!isAuthenticated) {
    // Zapisz bieżącą ścieżkę, aby powrócić po zalogowaniu
    localStorage.setItem('redirect_after_login', location.pathname);
    
    // Przekieruj na stronę logowania
    return <Navigate to="/auth/login" replace />;
  }
  
  // Jeśli użytkownik jest zalogowany, renderuj zagnieżdżone trasy
  return <Outlet />;
};

export default ProtectedRoute;