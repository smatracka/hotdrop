import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Konteksty
import { AuthProvider } from './contexts/AuthContext';

// Strony
import LandingPage from './pages/LandingPage/LandingPage';
import DropPage from './pages/DropPage/DropPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage/ThankYouPage';
import LoginPage from './pages/AuthPage/LoginPage';
import RegisterPage from './pages/AuthPage/RegisterPage';
import PrepaidPage from './pages/PrepaidPage/PrepaidPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import UpcomingDropsPage from './pages/UpcomingDropsPage/UpcomingDropsPage';
import ActiveDropsPage from './pages/ActiveDropsPage/ActiveDropsPage';
import PastDropsPage from './pages/PastDropsPage/PastDropsPage';

// Komponenty
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * Główny komponent aplikacji
 * Definiuje routing i wrapuje aplikację w niezbędne providery
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Strony publiczne */}
          <Route path="/" element={<Navigate to="/drops" />} />
          <Route path="/drops" element={<Navigate to="/drops/upcoming" />} />
          <Route path="/drops/upcoming" element={<UpcomingDropsPage />} />
          <Route path="/drops/active" element={<ActiveDropsPage />} />
          <Route path="/drops/past" element={<PastDropsPage />} />
          
          {/* Strony dropu */}
          <Route path="/drops/:dropId" element={<LandingPage />} />
          <Route path="/drops/:dropId/active" element={<DropPage />} />
          
          {/* Strony wymagające autoryzacji */}
          <Route element={<ProtectedRoute />}>
            <Route path="/drops/:dropId/prepaid" element={<PrepaidPage />} />
            <Route path="/drops/:dropId/checkout" element={<CheckoutPage />} />
            <Route path="/drops/:dropId/thank-you" element={<ThankYouPage />} />
          </Route>
          
          {/* Autoryzacja */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;