import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './CheckoutSummary.css';

/**
 * Komponent podsumowania zamówienia w procesie checkoutu
 * @param {Object} props - Właściwości komponentu
 * @returns {JSX.Element} Podsumowanie checkoutu
 */
const CheckoutSummary = ({
  checkoutData = {},
  productsData = [],
  shippingMethods = [],
  prepaidAmount = 0,
  onConfirm,
  onBack,
  isProcessing = false
}) => {
  // Dane płatności, dostawy i faktury
  const { payment = {}, shipping = {}, invoice = {} } = checkoutData;
  
  // Znalezienie wybranej metody dostawy
  const selectedShippingMethod = shippingMethods.find(method => method.id === shipping.shippingMethod) || {};
  
  // Obliczenie całkowitej kwoty
  const calculateTotal = () => {
    // Suma cen produktów
    const productsTotal = productsData.reduce((total, product) => {
      const quantity = product.quantity || 1;
      return total + (product.price * quantity);
    }, 0);
    
    // Koszt dostawy
    const shippingCost = selectedShippingMethod.price || 0;
    
    return productsTotal + shippingCost;
  };
  
  const totalAmount = calculateTotal();
  const hasSufficientFunds = prepaidAmount >= totalAmount;
  
  // Obsługa potwierdzenia zamówienia
  const handleConfirm = () => {
    if (hasSufficientFunds && onConfirm) {
      onConfirm();
    }
  };
  
  // Powrót do poprzedniego kroku
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };
  
  return (
    <div className="checkout-form checkout-summary">
      <h2 className="form-title">Podsumowanie zamówienia</h2>
      
      {/* Produkty */}
      <div className="form-section summary-section">
        <h3 className="section-subtitle">Produkty</h3>
        
        <div className="summary-products">
          {productsData.map(product => (
            <div key={product.id} className="summary-product">
              <div className="product-image">
                <img 
                  src={product.imageUrl || `https://storage.googleapis.com/drop-commerce-static/assets/images/${product.imageName}-sm.webp`} 
                  alt={product.name} 
                />
              </div>
              <div className="product-details">
                <div className="product-name">{product.name}</div>
                <div className="product-quantity">
                  {product.quantity || 1} x {product.price.toFixed(2)} zł
                </div>
              </div>
              <div className="product-total">
                {((product.quantity || 1) * product.price).toFixed(2)} zł
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dane dostawy */}
      <div className="form-section summary-section">
        <h3 className="section-subtitle">Dane dostawy</h3>
        
        <div className="summary-shipping">
          <div className="shipping-address">
            <strong>{shipping.firstName} {shipping.lastName}</strong>
            <p>{shipping.address}</p>
            <p>{shipping.postalCode} {shipping.city}</p>
            <p>{shipping.country}</p>
            <p>Tel: {shipping.phone}</p>
          </div>
          
          {selectedShippingMethod.id && (
            <div className="shipping-method">
              <div className="method-name">
                <strong>Metoda dostawy:</strong> {selectedShippingMethod.name}
              </div>
              <div className="method-price">
                {selectedShippingMethod.price.toFixed(2)} zł
              </div>
              <div className="method-time">
                Przewidywany czas dostawy: {selectedShippingMethod.estimatedDeliveryDays}
              </div>
            </div>
          )}
          
          {shipping.notes && (
            <div className="shipping-notes">
              <strong>Uwagi do zamówienia:</strong>
              <p>{shipping.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Dane do faktury - jeśli wymagana */}
      {invoice.requireInvoice && (
        <div className="form-section summary-section">
          <h3 className="section-subtitle">Dane do faktury</h3>
          
          <div className="summary-invoice">
            <strong>{invoice.companyName}</strong>
            <p>NIP: {invoice.taxId}</p>
            <p>{invoice.companyAddress}</p>
            <p>{invoice.companyPostalCode} {invoice.companyCity}</p>
            <p>{invoice.companyCountry}</p>
            
            {invoice.emailInvoice && invoice.invoiceEmail && (
              <p>Faktura zostanie wysłana na adres: <strong>{invoice.invoiceEmail}</strong></p>
            )}
          </div>
        </div>
      )}
      
      {/* Płatność */}
      <div className="form-section summary-section">
        <h3 className="section-subtitle">Metoda płatności</h3>
        
        <div className="summary-payment">
          <div className="payment-method">
            <strong>Prepaid</strong>
            <p>Zapłacone środki: {prepaidAmount.toFixed(2)} zł</p>
            
            {payment.method === 'card' && payment.cardDetails && (
              <p>Karta: •••• {payment.cardDetails.cardNumber.slice(-4)}</p>
            )}
            
            {totalAmount > 0 && (
              <div className="payment-total">
                <div className="total-row">
                  <span>Wartość zamówienia:</span>
                  <span>{totalAmount.toFixed(2)} zł</span>
                </div>
                <div className="total-row">
                  <span>Pozostanie na koncie:</span>
                  <span>{(prepaidAmount - totalAmount).toFixed(2)} zł</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Przyciski nawigacji */}
      <div className="form-actions">
        {onBack && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isProcessing}
          >
            Wstecz
          </Button>
        )}
        
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isProcessing || !hasSufficientFunds}
        >
          {isProcessing ? 'Przetwarzanie...' : 'Potwierdź zamówienie'}
        </Button>
      </div>
      
      {!hasSufficientFunds && (
        <div className="insufficient-funds">
          Brak wystarczających środków do złożenia zamówienia.
        </div>
      )}
    </div>
  );
};

CheckoutSummary.propTypes = {
  checkoutData: PropTypes.object,
  productsData: PropTypes.array,
  shippingMethods: PropTypes.array,
  prepaidAmount: PropTypes.number,
  onConfirm: PropTypes.func,
  onBack: PropTypes.func,
  isProcessing: PropTypes.bool
};

export default CheckoutSummary;