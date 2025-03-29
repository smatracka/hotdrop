/**
 * Waliduje dane dotyczące stanu magazynowego
 * @param {Object} data - Dane do walidacji
 * @returns {Object} - Wynik walidacji (isValid, errors)
 */
exports.validateInventoryData = (data) => {
    const errors = {};
    
    // Walidacja ilości
    if (data.quantity !== undefined) {
      if (typeof data.quantity !== 'number' || data.quantity < 0) {
        errors.quantity = 'Ilość musi być liczbą nieujemną';
      }
    }
    
    // Walidacja rezerwacji
    if (data.reserved !== undefined) {
      if (typeof data.reserved !== 'number' || data.reserved < 0) {
        errors.reserved = 'Liczba rezerwacji musi być liczbą nieujemną';
      }
    }
    
    // Walidacja progu niskiego stanu
    if (data.lowStockThreshold !== undefined) {
      if (typeof data.lowStockThreshold !== 'number' || data.lowStockThreshold < 0) {
        errors.lowStockThreshold = 'Próg niskiego stanu musi być liczbą nieujemną';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Waliduje dane dotyczące rezerwacji
   * @param {Object} data - Dane do walidacji
   * @returns {Object} - Wynik walidacji (isValid, errors)
   */
  exports.validateReservationData = (data) => {
    const errors = {};
    
    // Walidacja identyfikatora produktu
    if (!data.productId) {
      errors.productId = 'Identyfikator produktu jest wymagany';
    }
    
    // Walidacja ilości
    if (!data.quantity) {
      errors.quantity = 'Ilość jest wymagana';
    } else if (typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.quantity = 'Ilość musi być liczbą dodatnią';
    }
    
    // Walidacja identyfikatora sesji
    if (!data.sessionId) {
      errors.sessionId = 'Identyfikator sesji jest wymagany';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };