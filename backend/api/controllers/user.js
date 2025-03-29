// backend/api/controllers/user.js
// const User = require('../models/user');
const { hashPassword, verifyPassword, generateToken } = require('../utils/helpers');

// Rejestracja nowego użytkownika
exports.register = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    
    // Sprawdź czy email jest już zajęty
    // W rzeczywistym projekcie: const existingUser = await User.findOne({ email });
    const existingUser = false;
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Użytkownik z tym adresem email już istnieje'
      });
    }
    
    // Zahashuj hasło
    const hashedPassword = hashPassword(password);
    
    // Utwórz nowego użytkownika
    // W rzeczywistym projekcie:
    // const user = new User({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   role: 'seller',
    //   company
    // });
    // await user.save();
    
    // Zaślepka danych
    const user = {
      _id: '65fdca1234567890abcdef00',
      name,
      email,
      role: 'seller',
      company
    };
    
    res.status(201).json({
      success: true,
      message: 'Rejestracja zakończona pomyślnie',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas rejestracji użytkownika',
      error: error.message
    });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Znajdź użytkownika
    // W rzeczywistym projekcie: const user = await User.findOne({ email }).select('+password');
    const user = email === 'test@example.com' ? {
      _id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com',
      role: 'seller',
      password: hashPassword('password123') // Symulacja hasła
    } : null;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy email lub hasło'
      });
    }
    
    // Sprawdź hasło
    // W rzeczywistym projekcie użylibyśmy verifyPassword z odpowiednim algorytmem
    const isPasswordValid = true; // Symulacja weryfikacji hasła
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy email lub hasło'
      });
    }
    
    // Wygeneruj token JWT
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas logowania',
      error: error.message
    });
  }
};

// Reset hasła - wysłanie linku
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Znajdź użytkownika
    // W rzeczywistym projekcie: const user = await User.findOne({ email });
    const user = email === 'test@example.com' ? {
      _id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com'
    } : null;
    
    if (!user) {
      // Nawet jeśli użytkownik nie istnieje, zwracamy sukces dla bezpieczeństwa
      return res.status(200).json({
        success: true,
        message: 'Jeśli adres email istnieje w naszej bazie, wysłaliśmy link do resetowania hasła'
      });
    }
    
    // Generuj token resetowania hasła
    const resetToken = generateToken(user._id, '1h');
    
    // Zapisz token i czas wygaśnięcia w bazie danych
    // W rzeczywistym projekcie:
    // user.passwordResetToken = resetToken;
    // user.passwordResetExpires = Date.now() + 3600000; // 1 godzina
    // await user.save({ validateBeforeSave: false });
    
    // Wysyłanie emaila z tokenem (zaślepka)
    // W rzeczywistym projekcie użylibyśmy np. nodemailer
    console.log(`Wysyłanie emaila do ${email} z tokenem resetowania hasła: ${resetToken}`);
    
    res.status(200).json({
      success: true,
      message: 'Jeśli adres email istnieje w naszej bazie, wysłaliśmy link do resetowania hasła'
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas wysyłania linku resetowania hasła',
      error: error.message
    });
  }
};

// Reset hasła - ustawienie nowego hasła
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // W rzeczywistym projekcie sprawdzilibyśmy token i znajdowali użytkownika
    // const user = await User.findOne({
    //   passwordResetToken: token,
    //   passwordResetExpires: { $gt: Date.now() }
    // });
    
    // Zaślepka weryfikacji tokena
    const user = token === 'valid-token' ? {
      _id: '65fdca1234567890abcdef00',
      name: 'Test User',
      email: 'test@example.com'
    } : null;
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token jest nieprawidłowy lub wygasł'
      });
    }
    
    // Zahashuj nowe hasło
    const hashedPassword = hashPassword(password);
    
    // Aktualizuj hasło i usuń token resetowania
    // W rzeczywistym projekcie:
    // user.password = hashedPassword;
    // user.passwordResetToken = undefined;
    // user.passwordResetExpires = undefined;
    // await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Hasło zostało pomyślnie zmienione'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas resetowania hasła',
      error: error.message
    });
  }
};

// Pobieranie danych zalogowanego użytkownika
exports.getMe = async (req, res) => {
  try {
    // W rzeczywistym projekcie pobieralibyśmy aktualne dane z bazy
    // const user = await User.findById(req.user.id);
    
    // Zaślepka danych użytkownika
    const user = {
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
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
      }
    };
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania danych użytkownika',
      error: error.message
    });
  }
};

// Aktualizacja danych profilu
exports.updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    
    // Filtruj pola, które mogą być aktualizowane
    const allowedFields = ['name', 'company', 'settings'];
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });
    
    // W rzeczywistym projekcie aktualizowalibyśmy dane w bazie
    // const user = await User.findByIdAndUpdate(req.user.id, filteredData, { new: true, runValidators: true });
    
    // Zaślepka aktualizacji danych
    const user = {
      _id: req.user.id,
      ...filteredData,
      email: req.user.email,
      role: req.user.role
    };
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profil został zaktualizowany pomyślnie'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji profilu',
      error: error.message
    });
  }
};

// Zmiana hasła
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // W rzeczywistym projekcie sprawdzilibyśmy aktualne hasło
    // const user = await User.findById(req.user.id).select('+password');
    // const isPasswordValid = await verifyPassword(currentPassword, user.password);
    
    // Zaślepka weryfikacji hasła
    const isPasswordValid = true;
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe aktualne hasło'
      });
    }
    
    // Zahashuj nowe hasło
    const hashedPassword = hashPassword(newPassword);
    
    // Aktualizuj hasło
    // W rzeczywistym projekcie:
    // user.password = hashedPassword;
    // await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Hasło zostało zmienione pomyślnie'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas zmiany hasła',
      error: error.message
    });
  }
};

// Wylogowanie
exports.logout = async (req, res) => {
  try {
    // W rzeczywistym projekcie moglibyśmy dodać token do blacklisty
    // lub anulować sesję użytkownika
    
    res.status(200).json({
      success: true,
      message: 'Wylogowano pomyślnie'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas wylogowywania',
      error: error.message
    });
  }
};