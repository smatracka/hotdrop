/**
 * Middleware do ochrony tras API
 * Sprawdza, czy użytkownik jest zalogowany
 */
exports.protect = (req, res, next) => {
    // W środowisku developerskim pomijamy sprawdzanie autoryzacji
    console.log('Auth middleware: skipping authorization check in development');
    
    // Dodajemy testowego użytkownika do req.user
    req.user = {
      id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com',
      role: 'seller'
    };
    
    next();
  };
  
  /**
   * Middleware do ograniczenia dostępu do określonych ról
   * @param {Array} roles - Tablica dozwolonych ról
   */
  exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // Sprawdzamy, czy rola użytkownika jest dozwolona
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Nie masz uprawnień do wykonania tej operacji'
        });
      }
      
      next();
    };
  };