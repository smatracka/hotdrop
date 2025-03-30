import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ShoppingTimer.css';

/**
 * Komponent timera zakupowego
 * Wyświetla czas pozostały na zakupy (domyślnie 10 minut)
 * Wywołuje callback po upływie czasu
 */
const ShoppingTimer = ({ 
  initialTime = 600, // 10 minut w sekundach
  onTimeEnd,
  warningTime = 120, // 2 minuty w sekundach - czas do ostrzeżenia
  className = '',
  size = 'medium' // small, medium, large
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const requestRef = useRef();
  const lastUpdateRef = useRef(Date.now());
  const startTimeRef = useRef(Date.now());
  
  // Obliczenie pozostałego czasu
  const updateTimeLeft = () => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const newTimeLeft = Math.max(0, initialTime - Math.floor(elapsed / 1000));
    
    // Ustawienie stanów ostrzeżeń
    setIsWarning(newTimeLeft <= warningTime);
    setIsCritical(newTimeLeft <= 30); // 30 sekund = stan krytyczny
    
    // Aktualizacja pozostałego czasu
    setTimeLeft(newTimeLeft);
    
    // Jeśli czas się skończył, wywołaj callback
    if (newTimeLeft === 0 && onTimeEnd) {
      onTimeEnd();
      return;
    }
    
    // Kontynuuj animację
    requestRef.current = requestAnimationFrame(updateTimeLeft);
  };
  
  // Uruchomienie i czyszczenie timera
  useEffect(() => {
    // Odzyskiwanie stanu timera z localStorage jeśli istnieje
    const storedStartTime = localStorage.getItem('shopping-timer-start');
    if (storedStartTime) {
      const parsedStartTime = parseInt(storedStartTime, 10);
      if (!isNaN(parsedStartTime)) {
        startTimeRef.current = parsedStartTime;
      }
    } else {
      // Zapisz nowy czas startu
      localStorage.setItem('shopping-timer-start', startTimeRef.current.toString());
    }
    
    // Uruchom animację
    requestRef.current = requestAnimationFrame(updateTimeLeft);
    
    // Czyszczenie przy unmount
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);
  
  // Formatowanie czasu w formacie MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Klasy CSS na podstawie stanu timera
  const timerClasses = [
    'shopping-timer',
    `shopping-timer--${size}`,
    isWarning ? 'shopping-timer--warning' : '',
    isCritical ? 'shopping-timer--critical' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={timerClasses}>
      <div className="shopping-timer-header">
        <span className="shopping-timer-title">Pozostały czas na zakupy:</span>
      </div>
      
      <div className="shopping-timer-value">
        {formatTime(timeLeft)}
      </div>
      
      <div className="shopping-timer-bar">
        <div 
          className="shopping-timer-progress" 
          style={{ width: `${(timeLeft / initialTime) * 100}%` }}
        ></div>
      </div>
      
      <div className="shopping-timer-warning">
        Po upływie czasu Twój koszyk zostanie opróżniony
      </div>
    </div>
  );
};

ShoppingTimer.propTypes = {
  initialTime: PropTypes.number,
  onTimeEnd: PropTypes.func,
  warningTime: PropTypes.number,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default ShoppingTimer;