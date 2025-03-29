// backend/api/services/userService.js
const User = require('../models/user');
const { hashPassword, verifyPassword, generateToken } = require('../utils/helpers');
const emailService = require('./emailService');

/**
 * Rejestracja nowego użytkownika
 * 
 * @param {Object} userData - Dane użytkownika
 * @returns {Promise<Object>} - Utworzony użytkownik
 */
exports.register = async (userData) => {
  try {
    const { email, password } = userData;
    
    // Sprawdź czy email jest już zajęty
    // W rzeczywistym projekcie: const existingUser = await User.findOne({ email });
    const existingUser = false;
    
    if (existingUser) {
      throw new Error('Użytkownik z tym adresem email już istnieje');
    }
    
    // Zahashuj hasło
    const hashedPassword = hashPassword(password);
    
    // Utwórz nowego użytkownika
    // W rzeczywistym projekcie:
    // const user = new User({
    //   ...userData,
    //   password: hashedPassword,
    //   role: 'seller'
    // });
    // await user.save();
    
    // Zaślepka
    const user = {
      _id: '65fdca1234567890abcdef' + Math.floor(Math.random() * 100),
      ...userData,
      role: 'seller',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Wyślij email potwierdzający
    await emailService.sendEmail({
      to: email,
      subject: 'Potwierdzenie rejestracji',
      text: `Dziękujemy za rejestrację w serwisie Drop Commerce. Twoje konto zostało utworzone pomyślnie.`,
      html: `
        <h1>Potwierdzenie rejestracji</h1>
        <p>Dziękujemy za rejestrację w serwisie Drop Commerce.</p>
        <p>Twoje konto zostało utworzone pomyślnie.</p>
      `
    });
    
    // Nie zwracaj hasła
    delete user.password;
    
    return user;
  } catch (error) {
    throw new Error(`Error registering user: ${error.message}`);
  }
};

/**
 * Logowanie użytkownika
 * 
 * @param {string} email - Email użytkownika
 * @param {string} password - Hasło użytkownika
 * @returns {Promise<Object>} - Dane zalogowanego użytkownika i token
 */
exports.login = async (email, password) => {
  try {
    // Znajdź użytkownika
    // W rzeczywistym projekcie: const user = await User.findOne({ email }).select('+password');
    
    // Zaślepka
    const user = email === 'test@example.com' ? {
      _id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com',
      role: 'seller',
      password: hashPassword('password123') // Symulacja hasła
    } : null;
    
    if (!user) {
      throw new Error('Nieprawidłowy email lub hasło');
    }
    
    // Sprawdź hasło
    const isPasswordValid = true; // W rzeczywistym projekcie: verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      throw new Error('Nieprawidłowy email lub hasło');
    }
    
    // Wygeneruj token JWT
    const token = generateToken(user._id);
    
    // Nie zwracaj hasła
    const userResponse = { ...user };
    delete userResponse.password;
    
    return { token, user: userResponse };
  } catch (error) {
    throw new Error(`Error during login: ${error.message}`);
  }
};

/**
 * Wysłanie linku resetowania hasła
 * 
 * @param {string} email - Email użytkownika
 * @returns {Promise<boolean>} - Czy operacja się powiodła
 */
exports.forgotPassword = async (email) => {
  try {
    // Znajdź użytkownika
    // W rzeczywistym projekcie: const user = await User.findOne({ email });
    const user = email === 'test@example.com' ? {
      _id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com',
    } : null;
    
    if (!user) {
      // Nawet jeśli użytkownik nie istnieje, zwracamy sukces dla bezpieczeństwa
      return true;
    }
    
    // Generuj token resetowania hasła
    const resetToken = generateToken(user._id, '1h');
    
    // Zapisz token i czas wygaśnięcia w bazie danych
    // W rzeczywistym projekcie:
    // user.passwordResetToken = resetToken;
    // user.passwordResetExpires = Date.now() + 3600000; // 1 godzina
    // await user.save({ validateBeforeSave: false });
    
    // Wysyłanie emaila z tokenem
    await emailService.sendEmail({
      to: email,
      subject: 'Reset hasła',
      text: `Aby zresetować hasło, kliknij w link: http://example.com/reset-password/${resetToken}`,
      html: `
        <h1>Reset hasła</h1>
        <p>Aby zresetować hasło, kliknij w poniższy link:</p>
        <p><a href="http://example.com/reset-password/${resetToken}">Resetuj hasło</a></p>
        <p>Link jest ważny przez 1 godzinę.</p>
      `
    });
    
    return true;
  } catch (error) {
    throw new Error(`Error during password reset: ${error.message}`);
  }
};

/**
 * Resetowanie hasła
 * 
 * @param {string} token - Token resetowania hasła
 * @param {string} password - Nowe hasło
 * @returns {Promise<boolean>} - Czy operacja się powiodła
 */
exports.resetPassword = async (token, password) => {
  try {
    // W rzeczywistym projekcie sprawdzilibyśmy token i znajdowali użytkownika
    // const user = await User.findOne({
    //   passwordResetToken: token,
    //   passwordResetExpires: { $gt: Date.now() }
    // });
    
    // Zaślepka
    const user = token === 'valid-token' ? {
      _id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com'
    } : null;
    
    if (!user) {
      throw new Error('Token jest nieprawidłowy lub wygasł');
    }
    
    // Zahashuj nowe hasło
    const hashedPassword = hashPassword(password);
    
    // Aktualizuj hasło i usuń token resetowania
    // W rzeczywistym projekcie:
    // user.password = hashedPassword;
    // user.passwordResetToken = undefined;
    // user.passwordResetExpires = undefined;
    // await user.save();
    
    // Powiadom użytkownika o zmianie hasła
    await emailService.sendEmail({
      to: user.email,
      subject: 'Hasło zostało zmienione',
      text: `Twoje hasło zostało pomyślnie zmienione.`,
      html: `
        <h1>Hasło zostało zmienione</h1>
        <p>Twoje hasło zostało pomyślnie zmienione.</p>
        <p>Jeśli nie zmieniałeś hasła, skontaktuj się z administratorem.</p>
      `
    });
    
    return true;
  } catch (error) {
    throw new Error(`Error during password reset: ${error.message}`);
  }
};

/**
 * Pobieranie danych użytkownika
 * 
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Object>} - Dane użytkownika
 */
exports.getUserById = async (userId) => {
  try {
    // W rzeczywistym projekcie: return await User.findById(userId);
    
    // Zaślepka
    return {
      _id: userId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'seller',
      company: {
        name: 'Przykładowa Firma',
        vatId: 'PL1234567890',
        address: {
          street: 'ul. Biznesowa 10',
          city: 'Warszawa',
          postalCode: '00-001',
          country: 'Polska'
        }
      },
      settings: {
        currency: 'PLN',
        language: 'pl',
        notifications: {
          email: true,
          sms: false
        }
      },
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-01T10:00:00Z')
    };
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

/**
 * Aktualizacja danych użytkownika
 * 
 * @param {string} userId - ID użytkownika
 * @param {Object} userData - Dane do aktualizacji
 * @returns {Promise<Object>} - Zaktualizowane dane użytkownika
 */
exports.updateUser = async (userId, userData) => {
  try {
    // Filtruj pola, które mogą być aktualizowane
    const allowedFields = ['name', 'company', 'settings'];
    const filteredData = {};
    
    Object.keys(userData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = userData[key];
      }
    });
    
    // W rzeczywistym projekcie:
    // const user = await User.findByIdAndUpdate(userId, filteredData, { 
    //   new: true, 
    //   runValidators: true 
    // });
    
    // Zaślepka
    const user = await exports.getUserById(userId);
    Object.assign(user, filteredData);
    user.updatedAt = new Date();
    
    return user;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

/**
 * Zmiana hasła użytkownika
 * 
 * @param {string} userId - ID użytkownika
 * @param {string} currentPassword - Aktualne hasło
 * @param {string} newPassword - Nowe hasło
 * @returns {Promise<boolean>} - Czy operacja się powiodła
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // W rzeczywistym projekcie:
    // const user = await User.findById(userId).select('+password');
    // const isPasswordValid = verifyPassword(currentPassword, user.password);
    
    // Zaślepka
    const isPasswordValid = true;
    
    if (!isPasswordValid) {
      throw new Error('Nieprawidłowe aktualne hasło');
    }
    
    // Zahashuj nowe hasło
    const hashedPassword = hashPassword(newPassword);
    
    // Aktualizuj hasło
    // W rzeczywistym projekcie:
    // user.password = hashedPassword;
    // await user.save();
    
    // Powiadom użytkownika o zmianie hasła
    await emailService.sendEmail({
      to: 'test@example.com', // W rzeczywistym projekcie: user.email
      subject: 'Hasło zostało zmienione',
      text: `Twoje hasło zostało pomyślnie zmienione.`,
      html: `
        <h1>Hasło zostało zmienione</h1>
        <p>Twoje hasło zostało pomyślnie zmienione.</p>
        <p>Jeśli nie zmieniałeś hasła, skontaktuj się z administratorem.</p>
      `
    });
    
    return true;
  } catch (error) {
    throw new Error(`Error changing password: ${error.message}`);
  }
};