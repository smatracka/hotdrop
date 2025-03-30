import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './CheckoutForms.css';

/**
 * Formularz danych do faktury w procesie checkoutu
 * @param {Object} props - Właściwości komponentu
 * @returns {JSX.Element} Formularz faktury
 */
const InvoiceForm = ({
  invoiceData = {},
  onDataChange,
  onNext,
  onBack,
  isLoading = false
}) => {
  // Stany formularza
  const [requireInvoice, setRequireInvoice] = useState(invoiceData.requireInvoice || false);
  const [formData, setFormData] = useState({
    companyName: invoiceData.companyName || '',
    taxId: invoiceData.taxId || '',
    companyAddress: invoiceData.companyAddress || '',
    companyCity: invoiceData.companyCity || '',
    companyPostalCode: invoiceData.companyPostalCode || '',
    companyCountry: invoiceData.companyCountry || 'Polska',
    emailInvoice: invoiceData.emailInvoice || true,
    invoiceEmail: invoiceData.invoiceEmail || ''
  });
  const [validateFields, setValidateFields] = useState(false);
  
  // Obsługa przełącznika faktury
  const handleInvoiceToggle = (e) => {
    const isRequired = e.target.checked;
    setRequireInvoice(isRequired);
    
    // Aktualizacja danych w komponencie nadrzędnym
    onDataChange({
      ...formData,
      requireInvoice: isRequired
    });
  };
  
  // Obsługa zmiany wartości pól formularza
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Specjalna obsługa NIP - tylko cyfry i myślniki
    if (name === 'taxId' && !/^[0-9\-]*$/.test(value)) {
      return;
    }
    
    // Specjalna obsługa kodu pocztowego - format XX-XXX
    if (name === 'companyPostalCode' && value.length > 0) {
      // Tylko cyfry i myślnik w określonym formacie
      if (!/^[0-9]{0,2}-?[0-9]{0,3}$/.test(value)) return;
      
      // Automatyczne dodawanie myślnika po dwóch cyfrach
      if (value.length === 2 && formData.companyPostalCode.length === 1 && !value.includes('-')) {
        const newValue = value + '-';
        setFormData({
          ...formData,
          [name]: newValue
        });
        
        // Aktualizacja danych w komponencie nadrzędnym
        onDataChange({
          ...formData,
          [name]: newValue,
          requireInvoice
        });
        
        return;
      }
    }
    
    // Aktualizacja stanu formularza
    const updatedFormData = {
      ...formData,
      [name]: newValue
    };
    
    setFormData(updatedFormData);
    
    // Aktualizacja danych w komponencie nadrzędnym
    onDataChange({
      ...updatedFormData,
      requireInvoice
    });
  };
  
  // Walidacja formularza
  const validateForm = () => {
    // Jeśli faktura nie jest wymagana, formularz jest zawsze poprawny
    if (!requireInvoice) {
      return true;
    }
    
    setValidateFields(true);
    
    // Wymagane pola dla faktury
    const requiredFields = ['companyName', 'taxId', 'companyAddress', 'companyCity', 'companyPostalCode'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    
    // Walidacja NIP (10 cyfr, może mieć myślniki)
    const taxIdDigits = formData.taxId.replace(/\D/g, '');
    if (taxIdDigits.length !== 10) {
      return false;
    }
    
    // Walidacja kodu pocztowego
    if (!/^\d{2}-\d{3}$/.test(formData.companyPostalCode)) {
      return false;
    }
    
    // Walidacja emaila faktury, jeśli zaznaczono wysyłkę mailem
    if (formData.emailInvoice && !formData.invoiceEmail) {
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
  
  return (
    <div className="checkout-form invoice-form">
      <h2 className="form-title">Dane do faktury</h2>
      
      <div className="invoice-toggle">
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={requireInvoice}
            onChange={handleInvoiceToggle}
          />
          <span className="toggle-label">Chcę otrzymać fakturę VAT</span>
        </label>
      </div>
      
      {requireInvoice && (
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="companyName">Nazwa firmy *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className={validateFields && !formData.companyName ? 'invalid' : ''}
            />
            {validateFields && !formData.companyName && (
              <div className="error-message">Pole wymagane</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="taxId">NIP *</label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              placeholder="0000000000 lub 000-000-00-00"
              value={formData.taxId}
              onChange={handleInputChange}
              required
              className={validateFields && formData.taxId.replace(/\D/g, '').length !== 10 ? 'invalid' : ''}
            />
            {validateFields && formData.taxId.replace(/\D/g, '').length !== 10 && (
              <div className="error-message">Podaj poprawny NIP (10 cyfr)</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="companyAddress">Adres *</label>
            <input
              type="text"
              id="companyAddress"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleInputChange}
              required
              className={validateFields && !formData.companyAddress ? 'invalid' : ''}
            />
            {validateFields && !formData.companyAddress && (
              <div className="error-message">Pole wymagane</div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyPostalCode">Kod pocztowy *</label>
              <input
                type="text"
                id="companyPostalCode"
                name="companyPostalCode"
                placeholder="00-000"
                value={formData.companyPostalCode}
                onChange={handleInputChange}
                maxLength="6"
                required
                className={validateFields && !/^\d{2}-\d{3}$/.test(formData.companyPostalCode) ? 'invalid' : ''}
              />
              {validateFields && !/^\d{2}-\d{3}$/.test(formData.companyPostalCode) && (
                <div className="error-message">Podaj poprawny kod pocztowy (format: 00-000)</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="companyCity">Miejscowość *</label>
              <input
                type="text"
                id="companyCity"
                name="companyCity"
                value={formData.companyCity}
                onChange={handleInputChange}
                required
                className={validateFields && !formData.companyCity ? 'invalid' : ''}
              />
              {validateFields && !formData.companyCity && (
                <div className="error-message">Pole wymagane</div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="companyCountry">Kraj *</label>
            <select
              id="companyCountry"
              name="companyCountry"
              value={formData.companyCountry}
              onChange={handleInputChange}
              required
            >
              <option value="Polska">Polska</option>
              <option value="Niemcy">Niemcy</option>
              <option value="Czechy">Czechy</option>
              <option value="Słowacja">Słowacja</option>
            </select>
          </div>
          
          <div className="invoice-email-section">
            <label className="toggle-control">
              <input
                type="checkbox"
                name="emailInvoice"
                checked={formData.emailInvoice}
                onChange={handleInputChange}
              />
              <span className="toggle-label">Wyślij fakturę na adres email</span>
            </label>
            
            {formData.emailInvoice && (
              <div className="form-group email-group">
                <input
                  type="email"
                  id="invoiceEmail"
                  name="invoiceEmail"
                  placeholder="Twój adres email"
                  value={formData.invoiceEmail}
                  onChange={handleInputChange}
                  required
                  className={validateFields && !formData.invoiceEmail ? 'invalid' : ''}
                />
                {validateFields && !formData.invoiceEmail && (
                  <div className="error-message">Podaj adres email dla faktury</div>
                )}
              </div>
            )}
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
    </div>
  );
};

InvoiceForm.propTypes = {
  invoiceData: PropTypes.object,
  onDataChange: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  isLoading: PropTypes.bool
};

export default InvoiceForm;