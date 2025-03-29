// backend/api/services/emailService.js

/**
 * Wysyła email
 * 
 * @param {Object} options - Opcje emaila
 * @param {string} options.to - Adres odbiorcy
 * @param {string} options.subject - Temat emaila
 * @param {string} options.text - Treść tekstowa emaila
 * @param {string} options.html - Treść HTML emaila
 * @returns {Promise<boolean>} - Czy email został wysłany pomyślnie
 */
exports.sendEmail = async (options) => {
    try {
      const { to, subject, text, html } = options;
      
      // W rzeczywistym projekcie używalibyśmy biblioteki nodemailer lub usługi SendGrid
      console.log(`Wysyłanie emaila do ${to}`);
      console.log(`Temat: ${subject}`);
      console.log(`Treść: ${text}`);
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };
  
  /**
   * Wysyła powiadomienie o rozpoczęciu dropu
   * 
   * @param {Object} drop - Dane dropu
   * @param {Array<Object>} subscribers - Lista subskrybentów
   * @returns {Promise<boolean>} - Czy powiadomienia zostały wysłane pomyślnie
   */
  exports.sendDropStartNotification = async (drop, subscribers) => {
    try {
      console.log(`Wysyłanie powiadomień o rozpoczęciu dropu "${drop.name}" do ${subscribers.length} subskrybentów`);
      
      // W rzeczywistym projekcie wysyłalibyśmy maile do wszystkich subskrybentów
      
      return true;
    } catch (error) {
      console.error('Error sending drop notifications:', error);
      return false;
    }
  };
  
  /**
   * Wysyła potwierdzenie zamówienia
   * 
   * @param {Object} order - Dane zamówienia
   * @returns {Promise<boolean>} - Czy email został wysłany pomyślnie
   */
  exports.sendOrderConfirmation = async (order) => {
    try {
      const { customer, orderNumber, totalAmount } = order;
      
      const options = {
        to: customer.email,
        subject: `Potwierdzenie zamówienia ${orderNumber}`,
        text: `Dziękujemy za zamówienie ${orderNumber}. Łączna kwota: ${totalAmount} PLN.`,
        html: `
          <h1>Dziękujemy za zamówienie!</h1>
          <p><strong>Numer zamówienia:</strong> ${orderNumber}</p>
          <p><strong>Łączna kwota:</strong> ${totalAmount} PLN</p>
        `
      };
      
      return await exports.sendEmail(options);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  };
  
  /**
   * Wysyła powiadomienie o zmianie statusu zamówienia
   * 
   * @param {Object} order - Dane zamówienia
   * @param {string} oldStatus - Poprzedni status
   * @returns {Promise<boolean>} - Czy email został wysłany pomyślnie
   */
  exports.sendOrderStatusUpdate = async (order, oldStatus) => {
    try {
      const { customer, orderNumber, status } = order;
      
      const statusMessages = {
        paid: 'Zamówienie zostało opłacone',
        shipped: 'Zamówienie zostało wysłane',
        delivered: 'Zamówienie zostało dostarczone',
        cancelled: 'Zamówienie zostało anulowane'
      };
      
      const message = statusMessages[status] || `Status zamówienia został zmieniony na: ${status}`;
      
      const options = {
        to: customer.email,
        subject: `Aktualizacja zamówienia ${orderNumber}`,
        text: `${message}. Numer zamówienia: ${orderNumber}.`,
        html: `
          <h1>Aktualizacja zamówienia</h1>
          <p>${message}</p>
          <p><strong>Numer zamówienia:</strong> ${orderNumber}</p>
        `
      };
      
      return await exports.sendEmail(options);
    } catch (error) {
      console.error('Error sending order status update:', error);
      return false;
    }
  };
  
  /**
   * Wysyła powiadomienie o zbliżającym się dropie
   * 
   * @param {Object} drop - Dane dropu
   * @param {number} hoursRemaining - Liczba godzin do rozpoczęcia
   * @returns {Promise<boolean>} - Czy powiadomienia zostały wysłane pomyślnie
   */
  exports.sendUpcomingDropReminder = async (drop, hoursRemaining) => {
    try {
      // W rzeczywistym projekcie pobieralibyśmy listę zainteresowanych użytkowników
      
      console.log(`Wysyłanie przypomnień o zbliżającym się dropie "${drop.name}" (zostało ${hoursRemaining}h)`);
      
      return true;
    } catch (error) {
      console.error('Error sending drop reminders:', error);
      return false;
    }
  };