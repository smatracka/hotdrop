import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import { getPaymentMethods } from '../../services/api/paymentService';
import './CheckoutForms.css';

/**
 * Formularz płatności w procesie checkoutu
 * @param {Object} props - Właściwości komponentu
 * @returns {JSX.Element} Formularz płatności
 */
const PaymentForm = ({
  paymentData = {},
  onDataChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  // Stany formularza
  const [paymentMethod, setPaymentMethod] = useState(paymentData.method || 'prepaid');
  const [cardDetails, setCardDetails] = useState(paymentData.cardDetails || {
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: ''
  });
  const [availableMethods, setAvailableMethods] = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [prepaidAmount, setPrepaidAmount] = useState(paymentData.prepaidAmount || 0);
  
  // Pobranie dostępnych metod płatności
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setMethodsLoading(true);
        const methods = await getPaymentMethods();
        setAvailableMethods(methods);
        setMethodsLoading(false);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        // W przypadku błędu, ustaw domyślne metody
        setAvailableMethods([
          { id: 'prepaid', name: 'Wpłacony prepaid', isDefault: true },
          { id: 'card', name: 'Karta płatnicza', isDefault: false },
          { id: 'blik', name: 'BLIK', isDefault: false },
          { id: 'transfer', name: 'Przelew online', isDefault: false }
        ]);
        setMethodsLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  // Obsługa zmiany metody płatności
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    
    // Aktualizacja danych płatności w komponencie nadrzędnym
    onDataChange({
      ...paymentData,
      method,
      cardDetails: method === 'card' ? cardDetails : null
    });
  };
  
  // Obsługa zmiany danych karty
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    
    // Specjalna obsługa numeru karty - tylko cyfry
    if (name === 'cardNumber') {
      if (!/^\d*$/.test(value)) return;
    }
    
    // Specjalna obsługa CVC - tylko cyfry
    if (name === 'cvc') {
      if (!/^\d*$/.test(value)) return;
    }
    
    // Specjalna obsługa daty ważności - format MM/YY
    if (name === 'expiry') {
      if (!/^\d{0,2}(\/\d{0,2})?$/.test(value)) return;
      
      // Automatyczne dodawanie ukośnika po dwóch cyfrach
      if (value.length === 2 && cardDetails.expiry.length === 1) {
        setCardDetails({
          ...cardDetails,
          [name]: value + '/'
        });
        return;
      }
    }
    
    const updatedCardDetails = {
      ...cardDetails,
      [name]: value
    };
    
    setCardDetails(updatedCardDetails);
    
    // Aktualizacja danych płatności w komponencie nadrzędnym
    if (paymentMethod === 'card') {
      onDataChange({
        ...paymentData,
        method: paymentMethod,
        cardDetails: updatedCardDetails
      });
    }
  };
  
  // Przejście do następnego kroku
  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };
  
  // Powrót do poprzedniego kroku
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  return (
    <div className="checkout-form payment-form">
      <h2 className="form-title">Płatność</h2>
      
      {methodsLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Ładowanie metod płatności...</p>
        </div>
      ) : (
        <>
          {/* Informacja o prepaidzie */}
          {prepaidAmount > 0 && (
            <div className="prepaid-info">
              <div className="prepaid-amount">
                <span>Dostępne środki z prepaidu:</span>
                <span className="amount">{prepaidAmount.toFixed(2)} zł</span>
              </div>
            </div>
          )}
          
          {/* Wybór metody płatności */}
          <div className="form-section">
            <h3 className="section-subtitle">Wybierz metodę płatności</h3>
            
            <div className="payment-methods">
              {availableMethods.map(method => (
                <label key={method.id} className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => handlePaymentMethodChange(method.id)}
                  />
                  <span className="payment-method-name">{method.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Szczegóły karty płatniczej - widoczne tylko gdy wybrano kartę */}
          {paymentMethod === 'card' && (
            <div className="form-section card-details-section">
              <h3 className="section-subtitle">Dane karty płatniczej</h3>
              
              <div className="form-group">
                <label htmlFor="cardNumber">Numer karty</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardDetailsChange}
                  maxLength="16"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cardName">Imię i nazwisko na karcie</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  placeholder="Jan Kowalski"
                  value={cardDetails.cardName}
                  onChange={handleCardDetailsChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiry">Data ważności</label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleCardDetailsChange}
                    maxLength="5"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cvc">Kod CVC/CVV</label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={handleCardDetailsChange}
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              
              <div className="card-security-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Twoje dane są bezpieczne. Używamy szyfrowania SSL.</span>
              </div>
            </div>
          )}
          
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
        </>
      )}
    </div>
  );
};

PaymentForm.propTypes = {
  paymentData: PropTypes.object,
  onDataChange: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  isLoading: PropTypes.bool
};

export default PaymentForm;