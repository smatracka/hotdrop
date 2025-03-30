import React, { createContext, useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } from '../services/api/cartService';

// Utworzenie kontekstu koszyka
const CartContext = createContext();

/**
 * Hook do użycia kontekstu koszyka
 * @returns {Object} Kontekst koszyka
 */
export const useCart = () => {
  return useContext(CartContext);
};

/**
 * Provider kontekstu koszyka
 * Zarządza stanem koszyka i udostępnia metody do zarządzania koszykiem
 */
export const CartProvider = ({ children }) => {
  // Pobranie ID dropu z URL
  const { dropId } = useParams();
  
  // Stany koszyka
  const [cartItems, setCartItems] = useState({});
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Liczba produktów w koszyku
  const totalItems = Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
  
  // Pobieranie koszyka przy ładowaniu
  useEffect(() => {
    if (dropId) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [dropId]);
  
  // Aktualizacja liczby przedmiotów w koszyku
  useEffect(() => {
    setCartItemsCount(totalItems);
  }, [cartItems]);
  
  // Pobieranie koszyka
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cartData = await getCart(dropId);
      
      setCartItems(cartData.items || {});
      setCartTotal(cartData.total || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Nie udało się pobrać zawartości koszyka.');
      setLoading(false);
    }
  };
  
  // Dodawanie produktu do koszyka
  const addToCartHandler = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await addToCart(dropId, productId, quantity);
      
      setCartItems(result.items || {});
      setCartTotal(result.total || 0);
      setLoading(false);
      
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Nie udało się dodać produktu do koszyka.');
      setLoading(false);
      
      return false;
    }
  };
  
  // Usuwanie produktu z koszyka
  const removeFromCartHandler = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await removeFromCart(dropId, productId);
      
      setCartItems(result.items || {});
      setCartTotal(result.total || 0);
      setLoading(false);
      
      return true;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Nie udało się usunąć produktu z koszyka.');
      setLoading(false);
      
      return false;
    }
  };
  
  // Aktualizacja ilości produktu w koszyku
  const updateQuantityHandler = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await updateCartItemQuantity(dropId, productId, quantity);
      
      setCartItems(result.items || {});
      setCartTotal(result.total || 0);
      setLoading(false);
      
      return true;
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      setError('Nie udało się zaktualizować ilości produktu w koszyku.');
      setLoading(false);
      
      return false;
    }
  };
  
  // Czyszczenie koszyka
  const clearCartHandler = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await clearCart(dropId);
      
      setCartItems({});
      setCartTotal(0);
      setLoading(false);
      
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Nie udało się wyczyścić koszyka.');
      setLoading(false);
      
      return false;
    }
  };
  
  // Sprawdzanie, czy produkt jest w koszyku
  const isInCart = (productId) => {
    return cartItems.hasOwnProperty(productId);
  };
  
  // Pobieranie ilości produktu w koszyku
  const getCartItemQuantity = (productId) => {
    return cartItems[productId] || 0;
  };
  
  // Wartość kontekstu
  const value = {
    cartItems,
    cartTotal,
    loading,
    error,
    cartItemsCount,
    addToCart: addToCartHandler,
    removeFromCart: removeFromCartHandler,
    updateQuantity: updateQuantityHandler,
    clearCart: clearCartHandler,
    isInCart,
    getCartItemQuantity,
    fetchCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;