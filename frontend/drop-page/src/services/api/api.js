import axios from 'axios';

/**
 * Konfiguracja podstawowego klienta API
 * Z interceptorami do obsługi tokenów, błędów, itp.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.dropcommerce.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 sekund
});

/**
 * Interceptor do dodawania tokenu autoryzacyjnego
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor do obsługi odpowiedzi i błędów
 */
api.interceptors.response.use(
  (response) => {
    // Zwróć dane jeśli wszystko jest OK
    return response;
  },
  (error) => {
    // Obsługa wygasłego tokenu (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      // Tutaj można dodać przekierowanie do logowania
      window.location.href = '/auth/login';
      return Promise.reject(new Error('Sesja wygasła. Zaloguj się ponownie.'));
    }
    
    // Obsługa braku uprawnień (403)
    if (error.response && error.response.status === 403) {
      return Promise.reject(new Error('Brak uprawnień do wykonania tej operacji.'));
    }
    
    // Obsługa błędu serwera (500)
    if (error.response && error.response.status >= 500) {
      return Promise.reject(new Error('Wystąpił błąd serwera. Spróbuj ponownie później.'));
    }
    
    // Obsługa błędu sieci
    if (!error.response) {
      return Promise.reject(new Error('Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe.'));
    }
    
    // Zwróć oryginalny błąd jeśli nie został obsłużony powyżej
    return Promise.reject(error);
  }
);

// Funkcje pomocnicze do mockowania API podczas developmentu
const mockResponse = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: {
          success: true,
          data,
          message: "OK"
        } 
      });
    }, delay);
  });
};

// Mock dla getCart
const mockGetCart = () => {
  return mockResponse({
    items: {
      'product1': 2,
      'product2': 1
    },
    total: 799.97
  });
};

// Mock dla dropDetails
const mockDropDetails = (dropId) => {
  return mockResponse({
    id: dropId,
    name: 'Ekskluzywna Kolekcja Limitowana 2025',
    description: 'Wyjątkowe produkty w limitowanej edycji, dostępne tylko przez krótki czas.',
    startDate: new Date(Date.now() + 3600000).toISOString(), // 1 godzina w przyszłość
    endDate: new Date(Date.now() + 86400000).toISOString(), // 1 dzień w przyszłość
    isActive: false,
    showProductCount: true,
    productCount: 12,
    products: [
      {
        id: 'product1',
        name: 'T-shirt Urban Classic',
        price: 299.99,
        description: 'Limitowana edycja, 100% bawełna, unikatowy design.',
        imageName: 'tshirt-urban',
        availableQuantity: 10,
        initialQuantity: 20,
        isBestseller: true
      },
      {
        id: 'product2',
        name: 'Bluza Oversize Premium',
        price: 499.98,
        description: 'Ekskluzywny design, limitowana seria, ciepły materiał.',
        imageName: 'hoodie-premium',
        availableQuantity: 5,
        initialQuantity: 15,
        isBestseller: false
      },
      {
        id: 'product3',
        name: 'Czapka Snapback Pro',
        price: 159.99,
        description: 'Regulowany rozmiar, unikatowe wzornictwo, najwyższa jakość.',
        imageName: 'cap-snapback',
        availableQuantity: 8,
        initialQuantity: 25,
        isBestseller: false
      },
      {
        id: 'product4',
        name: 'Spodnie Cargo Elite',
        price: 399.99,
        description: 'Wzmacniane szwy, specjalna edycja, wysoka jakość.',
        imageName: 'pants-cargo',
        availableQuantity: 0,
        initialQuantity: 10,
        isBestseller: false
      }
    ]
  });
};

// W trybie development możemy podmieniać rzeczywiste wywołania API
if (process.env.NODE_ENV === 'development') {
  const originalGet = api.get;
  const originalPost = api.post;
  
  // Mock GET endpoints
  api.get = function(url, config) {
    console.log(`Mock API GET: ${url}`);
    
    // Symulacja odpowiedzi dla różnych endpointów
    if (url.match(/\/drops\/[^/]+$/)) {
      const dropId = url.split('/').pop();
      return mockDropDetails(dropId);
    }
    
    if (url.match(/\/drops\/[^/]+\/cart$/)) {
      return mockGetCart();
    }
    
    // Dla innych endpointów używamy rzeczywistego API
    return originalGet.call(this, url, config);
  };
  
  // Mock POST endpoints
  api.post = function(url, data, config) {
    console.log(`Mock API POST: ${url}`, data);
    
    // Tutaj możemy dodać więcej mocków dla innych endpointów POST
    
    // Dla innych endpointów używamy rzeczywistego API
    return originalPost.call(this, url, data, config);
  };
}

export default api;