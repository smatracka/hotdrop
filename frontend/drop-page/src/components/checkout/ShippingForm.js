import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import { getShippingMethods } from '../../services/api/orderService';
import './CheckoutForms.css';

/**
 * Formularz danych dostawy w procesie checkoutu
 * @param {Object} props - Właściwości komponentu
 * @returns {JSX.Element} Formularz dostawy
 */
const ShippingForm = ({
  shippingData = {},
  onDataChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  // Stany formularza
  const [formData, setFormData] = useState({
    firstName: shippingData.firstName || '',
    lastName: shippingData.lastName || '',
    address: shippingData.address || '',
    city: shippingData.city || '',
    postalCode: shippingData.postalCode || '',
    country: shippingData.country || 'Polska',
    phone: shippingData.phone || '',
    email: shippingData.email || '',
    shippingMethod: shippingData.shippingMethod || '',
    notes: shippingData.notes || ''
  });
  
  const [shippingMethods, setShippingMethods] = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [validateFields, setValidateFields] = useState(false);
  
  // Pobranie dostępnych metod dostawy
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        setMethodsLoading(true);
        const methods = await getShippingMethods({
          country: formData.country,
          postalCode: formData.postalCode
        });
        setShippingMethods(methods);
        
        // Jeśli nie wybrano metody dostawy, wybierz pierwszą dostępną
        if (!formData.shippingMethod && methods.length > 0) {
          handleInputChange({
            target: {
              name: 'shippingMethod',
              value: methods[0].id
            }
          });
        }
        
        setMethodsLoading(false);
      } catch (error) {
        console.error('Error fetching shipping methods:', error);
        // W przypadku błędu, ustaw domyślne metody
        const defaultMethods = [
          { id: 'courier', name: 'Kurier', price: 15.99, estimatedDeliveryDays: '1-2 dni robocze' },
          { id: 'parcelLocker', name: 'Paczkomat', price: 12.99, estimatedDeliveryDays: '1-2 dni robocze' },
          { id: 'post', name: 'Poczta Polska', price: 9.99, estimatedDeliveryDays: '2-3 dni robocze' }
        ];
        
        setShippingMethods(defaultMethods);
        
        // Jeśli nie wybrano metody dostawy, wybierz pierwszą dostępną
        if (!formData.shippingMethod) {
          handleInputChange({
            target: {
              name: 'shippingMethod',
              value: defaultMethods[0].id
            }
          });
        }
        
        setMethodsLoading(false);
      }
    };
    
    // Jeśli podano kraj i kod pocztowy, pobierz metody dostawy
    if (formData.country && formData.postalCode && formData.postalCode.length >= 5) {
      fetchShippingMethods();
    } else {
      setMethodsLoading(false);
      setShippingMethods([]);
    }
  }, [formData.country, formData.postalCode]);
  
  // Obsługa zmiany wartości pól formularza
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Specjalna obsługa kodu pocztowego - format XX-XXX
    if (name === 'postalCode' && value.length > 0) {
      // Tylko cyfry i myślnik w określonym formacie
      if (!/^[0-9]{0,2}-?[0-9]{0,3}$/.test(value)) return;
      
      // Automatyczne dodawanie myślnika po dwóch cyfrach
      if (value.length === 2 && formData.postalCode.length === 1 && !value.includes('-')) {
        const newValue = value + '-';
        setFormData({
          ...formData,
          [name]: newValue
        });
        
        // Aktualizacja danych w komponencie nadrzędnym
        onDataChange({
          ...formData,
          [name]: newValue
        });
        
        return;
      }
    }
    
    // Aktualizacja stanu formularza
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);
    
    // Aktualizacja danych w komponencie nadrzędnym
    onDataChange(updatedFormData);
  };
  
  // Walidacja formularza
  const validateForm = () => {
    setValidateFields(true);
    
    // Wymagane pola
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country', 'phone'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    
    // Walidacja kodu pocztowego
    if (!/^\d{2}-\d{3}$/.test(formData.postalCode)) {
      return false;
    }
    
    // Walidacja numeru telefonu
    if (!/^\d{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
      return false;
    }
    
    // Walidacja metody dostawy
    if (!formData.shippingMethod && shippingMethods.length > 0) {
      return false;
    }
    
    return true;
  };
  
  // Przejście do następnego kroku
  const handleNext = () => {
    if (validateForm() && onNext) {
      onNext();
    }
  };
  
  // Powrót do poprzedniego kroku
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  // Znalezienie wybranej metody dostawy
  const selectedMethod = shippingMethods.find(method => method.id === formData.shippingMethod);
  
  return (
    <div className="checkout-form shipping-form">
      <h2 className="form-title">Dane dostawy</h2>
      
      <div className="form-section">
        <h3 className="section-subtitle">Dane odbiorcy</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">Imię *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className={validateFields && !formData.firstName ? 'invalid' : ''}
            />
            {validateFields && !formData.firstName && (
              <div className="error-message">Pole wymagane</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Nazwisko *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className={validateFields && !formData.lastName ? 'invalid' : ''}
            />
            {validateFields && !formData.lastName && (
              <div className="error-message">Pole wymagane</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Adres *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className={validateFields && !formData.address ? 'invalid' : ''}
          />
          {validateFields && !formData.address && (
            <div className="error-message">Pole wymagane</div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="postalCode">Kod pocztowy *</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              placeholder="00-000"
              value={formData.postalCode}
              onChange={handleInputChange}
              maxLength="6"
              required
              className={validateFields && !/^\d{2}-\d{3}$/.test(formData.postalCode) ? 'invalid' : ''}
            />
            {validateFields && !/^\d{2}-\d{3}$/.test(formData.postalCode) && (
              <div className="error-message">Podaj poprawny kod pocztowy (format: 00-000)</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="city">Miejscowość *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className={validateFields && !formData.city ? 'invalid' : ''}
            />
            {validateFields && !formData.city && (
              <div className="error-message">Pole wymagane</div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="country">Kraj *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className={validateFields && !formData.country ? 'invalid' : ''}
            >
              <option value="Polska">Polska</option>
              <option value="Niemcy">Niemcy</option>
              <option value="Czechy">Czechy</option>
              <option value="Słowacja">Słowacja</option>
            </select>
            {validateFields && !formData.country && (
              <div className="error-message">Pole wymagane</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Telefon *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="000 000 000"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className={validateFields && !/^\d{9}$/.test(formData.phone.replace(/\s+/g, '')) ? 'invalid' : ''}
            />
            {validateFields && !/^\d{9}$/.test(formData.phone.replace(/\s+/g, '')) && (
              <div className="error-message">Podaj poprawny numer telefonu (9 cyfr)</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3 className="section-subtitle">Metoda dostawy</h3>
        
        {methodsLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Ładowanie metod dostawy...</p>
          </div>
        ) : shippingMethods.length > 0 ? (
          <>
            <div className="shipping-methods">
              {shippingMethods.map(method => (
                <label key={method.id} className="shipping-method-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method.id}
                    checked={formData.shippingMethod === method.id}
                    onChange={handleInputChange}
                  />
                  <div className="shipping-method-details">
                    <div className="shipping-method-name">{method.name}</div>
                    <div className="shipping-method-info">
                      <span className="shipping-method-price">{method.price.toFixed(2)} zł</span>
                      <span className="shipping-method-time">{method.estimatedDeliveryDays}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            {validateFields && !formData.shippingMethod && (
              <div className="error-message">Wybierz metodę dostawy</div>
            )}
          </>
        ) : (
          <div className="no-shipping-methods">
            Podaj poprawny adres, aby zobaczyć dostępne metody dostawy.
          </div>
        )}
      </div>
      
      <div className="form-section">
        <h3 className="section-subtitle">Uwagi do zamówienia</h3>
        
        <div className="form-group">
          <label htmlFor="notes">Dodatkowe informacje dla kuriera</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
          ></textarea>
        </div>
      </div>
      
      {/* Przyciski nawigacji */}
      <div className="form-actions">
        {onBack && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
          >
            Wstecz
          </Button>
        )}
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? 'Ładowanie...' : 'Dalej'}
        </Button>
      </div>
    </div>
  );
};

ShippingForm.propTypes = {
  shippingData: PropTypes.object,
  onDataChange: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  isLoading: PropTypes.bool
};

export default ShippingForm;