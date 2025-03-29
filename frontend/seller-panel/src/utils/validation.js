import * as yup from 'yup';

// Walidacja dla formularza logowania
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Wprowadź poprawny adres email')
    .required('Email jest wymagany'),
  password: yup
    .string()
    .required('Hasło jest wymagane')
});

// Walidacja dla formularza rejestracji
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Imię i nazwisko są wymagane')
    .min(3, 'Imię i nazwisko muszą zawierać co najmniej 3 znaki'),
  email: yup
    .string()
    .email('Wprowadź poprawny adres email')
    .required('Email jest wymagany'),
  password: yup
    .string()
    .required('Hasło jest wymagane')
    .min(8, 'Hasło musi zawierać co najmniej 8 znaków')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Hasło musi zawierać dużą literę, małą literę, cyfrę i znak specjalny'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Hasła muszą być takie same')
    .required('Potwierdzenie hasła jest wymagane'),
  company: yup.object().shape({
    name: yup
      .string()
      .required('Nazwa firmy jest wymagana'),
    vatId: yup
      .string()
      .required('NIP jest wymagany')
  }),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Musisz zaakceptować regulamin')
});

// Walidacja dla formularza resetu hasła
export const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Wprowadź poprawny adres email')
    .required('Email jest wymagany')
});

// Walidacja dla formularza nowego dropu
export const dropSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nazwa dropu jest wymagana')
    .max(100, 'Nazwa może mieć maksymalnie 100 znaków'),
  description: yup
    .string()
    .max(1000, 'Opis może mieć maksymalnie 1000 znaków'),
  startDate: yup
    .date()
    .required('Data rozpoczęcia jest wymagana')
    .min(new Date(), 'Data musi być w przyszłości'),
  timeLimit: yup
    .number()
    .required('Czas na złożenie zamówienia jest wymagany')
    .min(1, 'Minimalny czas to 1 minuta')
    .max(120, 'Maksymalny czas to 120 minut'),
  products: yup
    .array()
    .min(1, 'Wybierz co najmniej jeden produkt')
    .required('Produkty są wymagane')
});

// Walidacja dla formularza nowego produktu
export const productSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nazwa produktu jest wymagana')
    .max(100, 'Nazwa może mieć maksymalnie 100 znaków'),
  description: yup
    .string()
    .max(2000, 'Opis może mieć maksymalnie 2000 znaków'),
  sku: yup
    .string()
    .required('SKU jest wymagane'),
  price: yup
    .number()
    .required('Cena jest wymagana')
    .min(0, 'Cena nie może być ujemna'),
  quantity: yup
    .number()
    .required('Ilość jest wymagana')
    .min(0, 'Ilość nie może być ujemna')
    .integer('Ilość musi być liczbą całkowitą'),
  category: yup
    .string()
    .required('Kategoria jest wymagana'),
  imageUrls: yup
    .array()
    .of(yup.string())
});

// Walidacja dla formularza ustawień profilu
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Imię i nazwisko są wymagane'),
  company: yup.object().shape({
    name: yup
      .string()
      .required('Nazwa firmy jest wymagana'),
    vatId: yup
      .string()
      .required('NIP jest wymagany'),
    address: yup.object().shape({
      street: yup
        .string()
        .required('Ulica jest wymagana'),
      city: yup
        .string()
        .required('Miasto jest wymagane'),
      postalCode: yup
        .string()
        .required('Kod pocztowy jest wymagany'),
      country: yup
        .string()
        .required('Kraj jest wymagany')
    })
  })
});

// Walidacja dla formularza zmiany hasła
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Aktualne hasło jest wymagane'),
  newPassword: yup
    .string()
    .required('Nowe hasło jest wymagane')
    .min(8, 'Hasło musi zawierać co najmniej 8 znaków')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Hasło musi zawierać dużą literę, małą literę, cyfrę i znak specjalny'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Hasła muszą być takie same')
    .required('Potwierdzenie hasła jest wymagane')
});

// Walidacja dla formularza nowego zamówienia
export const orderSchema = yup.object().shape({
  customer: yup.object().shape({
    name: yup
      .string()
      .required('Imię i nazwisko klienta są wymagane'),
    email: yup
      .string()
      .email('Wprowadź poprawny adres email')
      .required('Email klienta jest wymagany'),
    phone: yup
      .string()
      .required('Numer telefonu klienta jest wymagany'),
    address: yup.object().shape({
      street: yup
        .string()
        .required('Ulica jest wymagana'),
      city: yup
        .string()
        .required('Miasto jest wymagane'),
      postalCode: yup
        .string()
        .required('Kod pocztowy jest wymagany'),
      country: yup
        .string()
        .required('Kraj jest wymagany')
    })
  }),
  items: yup
    .array()
    .of(
      yup.object().shape({
        product: yup
          .string()
          .required('Produkt jest wymagany'),
        quantity: yup
          .number()
          .required('Ilość jest wymagana')
          .min(1, 'Ilość musi być co najmniej 1')
          .integer('Ilość musi być liczbą całkowitą')
      })
    )
    .min(1, 'Dodaj co najmniej jeden produkt')
    .required('Produkty są wymagane'),
  paymentMethod: yup
    .string()
    .required('Metoda płatności jest wymagana')
});

// Funkcja walidująca adres email
export const isValidEmail = (email) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
};

// Funkcja walidująca numer telefonu
export const isValidPhone = (phone) => {
  return /^\+?[0-9\s-]{9,15}$/.test(phone);
};

// Funkcja walidująca kod pocztowy
export const isValidPostalCode = (postalCode) => {
  return /^[0-9]{2}-[0-9]{3}$/.test(postalCode);
};

// Funkcja walidująca NIP
export const isValidVatId = (vatId) => {
  return /^[A-Z]{0,2}[0-9]{10}$/.test(vatId.replace(/[\s-]/g, ''));
};

export default {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  dropSchema,
  productSchema,
  profileSchema,
  changePasswordSchema,
  orderSchema,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  isValidVatId
};