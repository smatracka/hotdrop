const paypal = require('@paypal/checkout-server-sdk');
const config = require('../config');
const logger = require('../utils/logger');
const { paypalClient } = require('../config/paymentProviders');

// Tworzenie zamówienia PayPal
exports.createOrder = async (amount, currency, paymentId, redirectUrl) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2)
        },
        reference_id: paymentId
      }],
      application_context: {
        return_url: redirectUrl || config.apiServiceUrl,
        cancel_url: redirectUrl ? `${redirectUrl}?status=canceled` : config.apiServiceUrl
      }
    });
    
    const response = await paypalClient.execute(request);
    
    if (response.statusCode !== 201) {
      throw new Error('Błąd podczas tworzenia zamówienia PayPal');
    }
    
    const order = response.result;
    
    // Znajdź link do zatwierdzenia
    const approveLink = order.links.find(link => link.rel === 'approve');
    
    return {
      orderId: order.id,
      status: order.status,
      approveUrl: approveLink.href
    };
  } catch (error) {
    logger.error('Error creating PayPal order:', error);
    throw error;
  }
};

// Przechwytywanie płatności PayPal
exports.captureOrder = async (orderId) => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.prefer('return=representation');
    
    const response = await paypalClient.execute(request);
    
    if (response.statusCode !== 201) {
      throw new Error('Błąd podczas przechwytywania płatności PayPal');
    }
    
    return {
      success: true,
      data: response.result
    };
  } catch (error) {
    logger.error('Error capturing PayPal order:', error);
    throw error;
  }
};

// Zwrot płatności PayPal
exports.refundPayment = async (payment, amount, reason) => {
  try {
    // Pobierz ID przechwycenia z danych dostawcy
    const captureId = payment.providerData.captureId;
    
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    request.prefer('return=representation');
    request.requestBody({
      amount: {
        currency_code: payment.currency.toUpperCase(),
        value: amount.toFixed(2)
      },
      note_to_payer: reason || 'Zwrot płatności'
    });
    
    const response = await paypalClient.execute(request);
    
    if (response.statusCode !== 201) {
      throw new Error('Błąd podczas zwracania płatności PayPal');
    }
    
    return {
      success: true,
      data: {
        refundId: response.result.id,
        status: response.result.status,
        refund: response.result
      }
    };
  } catch (error) {
    logger.error('Error refunding PayPal payment:', error);
    throw error;
  }
};