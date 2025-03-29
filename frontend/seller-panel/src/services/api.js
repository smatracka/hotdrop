import axios from 'axios';
import { toast } from 'react-toastify';

// Utwórz instancję axios z bazowym URL API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodaj token JWT do nagłówków, jeśli istnieje w localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor odpowiedzi z serwera
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Obsługa błędów autoryzacji (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        // Przekieruj do strony logowania przy wygaśnięciu tokena
        toast.error('Twoja sesja wygasła. Zaloguj się ponownie.');
        window.location.href = '/login';
      }
    }
    
    // Obsługa błędów serwera (500)
    if (error.response && error.response.status >= 500) {
      toast.error('Wystąpił błąd serwera. Spróbuj ponownie później.');
    }
    
    // Jeśli serwer zwraca informację o błędzie, pokaż ją w toaście
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else if (!error.response) {
      // Brak odpowiedzi z serwera (np. problem z siecią)
      toast.error('Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.');
    }
    
    return Promise.reject(error);
  }
);

export default api;