import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import PageFooter from '../../components/layout/PageFooter';
import { fetchDropDetails } from '../../services/api/dropService';
import { processPrepaidPayment } from '../../services/api/paymentService';
import './PrepaidPage.css';

/**
 * Strona wpłaty prepaidu przed dropem
 * Pozwala wpłacić środki, które będą wykorzystane podczas dropu
 */
const PrepaidPage = () => {
  const { dropId } = useParams();
  const navigate = useNavigate();
  
  // Stany
  const [dropData, setDropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Stany formularza
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: ''
  });
  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Polska',
    phone: ''
  });
  const [invoiceRequired, setInvoiceRequired] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    companyName: '',
    taxId: '',
    companyAddress: '',
    companyCity: '',
    companyPostalCode: '',
    companyCountry: 'Polska'
  });
  
  // Pobieranie danych o dropie
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDropDetails(dropId);
        setDropData(data);
        
        // Ustawienie domyślnej kwoty, jeśli drop ma minimalną kwotę prepaidu
        if (data.minPrepaidAmount) {
          setAmount(data.minPrepaidAmount.toString());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching drop data:', err);
        setError(err.message || 'Nie udało się załadować danych dropu.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dropId]);
  
  // Obsługa zmiany wartości pól formularza
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    
    switch (formType) {
      case 'card':
        setCardDetails(prev => ({ ...prev, [name]: value }));
        break;
      case 'shipping':
        setShippingDetails(prev => ({ ...prev, [name]: value }));
        break;
      case 'invoice':
        setInvoiceDetails(prev => ({ ...prev, [name]: value }));
        break;
      default:
        // Obsługa pól poza grupami
        if (name === 'amount') {
          // Walidacja kwoty (tylko liczby)
          if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
            setAmount(value);
          }
        } else if (name === 'paymentMethod') {
          setPaymentMethod(value);
        }
    }
  };
  
  // Walidacja formularza
  const validateForm = () => {
    // Walidacja kwoty
    if (!amount || parseFloat(amount) <= 0) {
      setError('Podaj prawidłową kwotę.');
      return false;
    }
    
    // Walidacja minimalnej kwoty
    if (dropData.minPrepaidAmount && parseFloat(amount) < dropData.minPrepaidAmount) {
      setError(`Minimalna kwota prepaidu to ${dropData.minPrepaidAmount} zł.`);
      return false;
    }
    
    // Walidacja maksymalnej kwoty
    if (dropData.maxPrepaidAmount && parseFloat(amount) > dropData.maxPrepaidAmount) {
      setError(`Maksymalna kwota prepaidu to ${dropData.maxPrepaidAmount} zł.`);
      return false;
    }
    
    // Walidacja metody płatności
    if (!paymentMethod) {
      setError('Wybierz metodę płatności.');
      return false;
    }
    
    // Walidacja danych karty (tylko jeśli wybrano płatność kartą)
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
        setError('Podaj prawidłowy numer karty.');
        return false;
      }
      
      if (!cardDetails.cardName) {
        setError('Podaj imię i nazwisko posiadacza karty.');
        return false;
      }
      
      if (!cardDetails.expiry || !cardDetails.expiry.includes('/')) {
        setError('Podaj prawidłową datę ważności karty (MM/RR).');
        return false;
      }
      
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        setError('Podaj prawidłowy kod CVC.');
        return false;
      }
    }
    
    // Walidacja danych wysyłki
    if (!shippingDetails.firstName || !shippingDetails.lastName) {
      setError('Podaj imię i nazwisko.');
      return false;
    }
    
    if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.postalCode) {
      setError('Podaj pełny adres dostawy.');
      return false;
    }
    
    if (!shippingDetails.phone) {
      setError('Podaj numer telefonu.');
      return false;
    }
    
    // Walidacja danych do faktury (tylko jeśli wymagana)
    if (invoiceRequired) {
      if (!invoiceDetails.companyName) {
        setError('Podaj nazwę firmy.');
        return false;
      }
      
      if (!invoiceDetails.taxId) {
        setError('Podaj NIP.');
        return false;
      }
      
      if (!invoiceDetails.companyAddress || !invoiceDetails.companyCity || !invoiceDetails.companyPostalCode) {
        setError('Podaj pełny adres firmy.');
        return false;
      }
    }
    
    // Wszystko OK
    setError(null);
    return true;
  };
  
  // Obsługa wpłaty prepaidu
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Walidacja formularza
    if (!validateForm()) {
      return;
    }
    
    try {
      setProcessing(true);
      
      // Przygotowanie danych płatności
      const paymentData = {
        amount: parseFloat(amount),
        paymentMethod,
        dropId,
        cardDetails: paymentMethod === 'card' ? cardDetails : null,
        shippingDetails,
        invoiceDetails: invoiceRequired ? invoiceDetails : null
      };
      
      // Wywołanie API do przetworzenia płatności
      const result = await processPrepaidPayment(paymentData);
      
      if (result.success) {
        // Przekieruj na stronę dropu
        navigate(`/drops/${dropId}`, { 
          state: { 
            prepaidSuccess: true,
            prepaidAmount: parseFloat(amount)
          }
        });
      } else {
        setError(result.error || 'Wystąpił błąd podczas przetwarzania płatności.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Error processing prepaid payment:', err);
      setError(err.message || 'Wystąpił błąd podczas przetwarzania płatności.');
      setProcessing(false);
    }
  };
  
  // Zawartość podczas ładowania
  if (loading) {
    return (
      <div className="prepaid-page">
        <PageHeader />
        <main className="prepaid-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ładowanie danych dropu...</p>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }
  
  // Sprawdzenie, czy drop istnieje
  if (!dropData) {
    return (
      <div className="prepaid-page">
        <PageHeader />
        <main className="prepaid-content">
          <div className="container">
            <div className="not-found-container">
              <h2>Drop nie został znaleziony</h2>
              <p>Podany drop nie istnieje lub został usunięty.</p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Powrót do strony głównej
              </button>
            </div>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }
  
  return (
    <div className="prepaid-page">
      <PageHeader />
      
      <main className="prepaid-content">
        <div className="container">
          <div className="prepaid-container">
            <h1 className="prepaid-title">Wpłata prepaidu - {dropData.name}</h1>
            
            <div className="prepaid-info">
              <p>Aby wziąć udział w dropie, musisz wpłacić prepaid, który będzie wykorzystany do zakupu produktów podczas dropu.</p>
              <p>Niewykorzystane środki zostaną zwrócone na Twoje konto po zakończeniu dropu.</p>
              
              {dropData.minPrepaidAmount && (
                <div className="prepaid-limits">
                  <span className="limit-label">Minimalna kwota wpłaty:</span>
                  <span className="limit-value">{dropData.minPrepaidAmount} zł</span>
                </div>
              )}
              
              {dropData.maxPrepaidAmount && (
                <div className="prepaid-limits">
                  <span className="limit-label">Maksymalna kwota wpłaty:</span>
                  <span className="limit-value">{dropData.maxPrepaidAmount} zł</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form className="prepaid-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2 className="section-title">Kwota i metoda płatności</h2>
                
                <div className="form-group">
                  <label htmlFor="amount">Kwota (PLN)</label>
                  <input 
                    type="text"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={(e) => handleInputChange(e)}
                    placeholder="Wpisz kwotę"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Metoda płatności</label>
                  <div className="payment-methods">
                    <label className="payment-method">
                      <input 
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => handleInputChange(e)}
                      />
                      <span className="payment-method-name">Karta płatnicza</span>
                    </label>
                    
                    <label className="payment-method">
                      <input 
                        type="radio"
                        name="paymentMethod"
                        value="blik"
                        checked={paymentMethod === 'blik'}
                        onChange={(e) => handleInputChange(e)}
                      />
                      <span className="payment-method-name">BLIK</span>
                    </label>
                    
                    <label className="payment-method">
                      <input 
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => handleInputChange(e)}
                      />
                      <span className="payment-method-name">Przelew online</span>
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="card-details">
                    <div className="form-group">
                      <label htmlFor="cardNumber">Numer karty</label>
                      <input 
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleInputChange(e, 'card')}
                        placeholder="1234 5678 9012 3456"
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
                        value={cardDetails.cardName}
                        onChange={(e) => handleInputChange(e, 'card')}
                        placeholder="Jan Kowalski"
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
                          value={cardDetails.expiry}
                          onChange={(e) => handleInputChange(e, 'card')}
                          placeholder="MM/RR"
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
                          value={cardDetails.cvc}
                          onChange={(e) => handleInputChange(e, 'card')}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-section">
                <h2 className="section-title">Dane dostawy</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Imię</label>
                    <input 
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingDetails.firstName}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Nazwisko</label>
                    <input 
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingDetails.lastName}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Adres</label>
                  <input 
                    type="text"
                    id="address"
                    name="address"
                    value={shippingDetails.address}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="postalCode">Kod pocztowy</label>
                    <input 
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingDetails.postalCode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city">Miejscowość</label>
                    <input 
                      type="text"
                      id="city"
                      name="city"
                      value={shippingDetails.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country">Kraj</label>
                    <select
                      id="country"
                      name="country"
                      value={shippingDetails.country}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    >
                      <option value="Polska">Polska</option>
                      <option value="Niemcy">Niemcy</option>
                      <option value="Czechy">Czechy</option>
                      <option value="Słowacja">Słowacja</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input 
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingDetails.phone}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <div className="invoice-toggle">
                  <label className="toggle-label">
                    <input 
                      type="checkbox"
                      checked={invoiceRequired}
                      onChange={() => setInvoiceRequired(!invoiceRequired)}
                    />
                    <span>Chcę otrzymać fakturę VAT</span>
                  </label>
                </div>
                
                {invoiceRequired && (
                  <div className="invoice-details">
                    <h2 className="section-title">Dane do faktury</h2>
                    
                    <div className="form-group">
                      <label htmlFor="companyName">Nazwa firmy</label>
                      <input 
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={invoiceDetails.companyName}
                        onChange={(e) => handleInputChange(e, 'invoice')}
                        required={invoiceRequired}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="taxId">NIP</label>
                      <input 
                        type="text"
                        id="taxId"
                        name="taxId"
                        value={invoiceDetails.taxId}
                        onChange={(e) => handleInputChange(e, 'invoice')}
                        required={invoiceRequired}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="companyAddress">Adres</label>
                      <input 
                        type="text"
                        id="companyAddress"
                        name="companyAddress"
                        value={invoiceDetails.companyAddress}
                        onChange={(e) => handleInputChange(e, 'invoice')}
                        required={invoiceRequired}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="companyPostalCode">Kod pocztowy</label>
                        <input 
                          type="text"
                          id="companyPostalCode"
                          name="companyPostalCode"
                          value={invoiceDetails.companyPostalCode}
                          onChange={(e) => handleInputChange(e, 'invoice')}
                          required={invoiceRequired}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="companyCity">Miejscowość</label>
                        <input 
                          type="text"
                          id="companyCity"
                          name="companyCity"
                          value={invoiceDetails.companyCity}
                          onChange={(e) => handleInputChange(e, 'invoice')}
                          required={invoiceRequired}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="companyCountry">Kraj</label>
                      <select
                        id="companyCountry"
                        name="companyCountry"
                        value={invoiceDetails.companyCountry}
                        onChange={(e) => handleInputChange(e, 'invoice')}
                        required={invoiceRequired}
                      >
                        <option value="Polska">Polska</option>
                        <option value="Niemcy">Niemcy</option>
                        <option value="Czechy">Czechy</option>
                        <option value="Słowacja">Słowacja</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-section form-actions">
                <div className="prepaid-summary">
                  <div className="summary-label">Do wpłaty:</div>
                  <div className="summary-value">{amount ? `${amount} zł` : '0.00 zł'}</div>
                </div>
                
                <div className="terms-agreement">
                  <label className="toggle-label">
                    <input type="checkbox" required />
                    <span>Zapoznałem się i akceptuję <a href="/terms" target="_blank">regulamin</a> i <a href="/privacy" target="_blank">politykę prywatności</a></span>
                  </label>
                </div>
                
                <button 
                  type="submit"
                  className="submit-button"
                  disabled={processing}
                >
                  {processing ? 'Przetwarzanie płatności...' : 'Wpłać prepaid'}
                </button>
                
                <div className="back-link">
                  <a href={`/drops/${dropId}`} className="back-to-drop">
                    Powrót do strony dropu
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default PrepaidPage;
                