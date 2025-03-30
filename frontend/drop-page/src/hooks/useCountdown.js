import { useState, useEffect, useRef } from 'react';

/**
 * Hook do obsługi odliczania czasu
 * Wykorzystuje requestAnimationFrame zamiast setInterval dla większej wydajności
 * 
 * @param {number|string|Date} targetDate - Data docelowa lub liczba sekund do odliczenia
 * @param {Function} onComplete - Funkcja wywoływana po zakończeniu odliczania
 * @param {boolean} autoStart - Czy automatycznie rozpocząć odliczanie
 * @returns {Object} Obiekt zawierający pozostały czas i funkcje kontrolne
 */
const useCountdown = (targetDate, onComplete, autoStart = true) => {
  // Stan przechowujący pozostały czas
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());
  
  // Referencje do animacji i czasu
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const startTimeRef = useRef(null);
  const targetTimeRef = useRef(null);
  
  // Referencja do statusu uruchomienia
  const isRunningRef = useRef(autoStart);
  
  // Obliczanie pozostałego czasu
  function calculateTimeLeft() {
    let difference;
    
    // Jeśli targetDate jest liczbą, traktujemy ją jako liczbę sekund
    if (typeof targetDate === 'number') {
      if (!targetTimeRef.current && !startTimeRef.current) {
        targetTimeRef.current = Date.now() + targetDate * 1000;
      }
      difference = targetTimeRef.current - Date.now();
    } 
    // W przeciwnym razie traktujemy jako datę
    else {
      const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
      difference = target.getTime() - Date.now();
    }
    
    // Jeśli czas minął
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        expired: true
      };
    }
    
    // Obliczenie jednostek czasu
    const totalSeconds = Math.floor(difference / 1000);
    return {
      days: Math.floor(totalSeconds / (60 * 60 * 24)),
      hours: Math.floor((totalSeconds / (60 * 60)) % 24),
      minutes: Math.floor((totalSeconds / 60) % 60),
      seconds: Math.floor(totalSeconds % 60),
      totalSeconds,
      expired: false
    };
  }
  
  // Funkcja aktualizująca czas
  const updateTime = (time) => {
    if (!isRunningRef.current) return;
    
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    // Aktualizuj tylko co sekundę, nie co klatkę animacji
    const deltaTime = time - previousTimeRef.current;
    if (deltaTime >= 1000) {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      previousTimeRef.current = time;
      
      // Jeśli czas się skończył
      if (newTimeLeft.expired) {
        stop();
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }
    
    // Kontynuuj animację
    requestRef.current = requestAnimationFrame(updateTime);
  };
  
  // Uruchomienie odliczania
  const start = () => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      previousTimeRef.current = undefined;
      startTimeRef.current = Date.now();
      
      // Jeśli podany jest czas w sekundach, a nie data
      if (typeof targetDate === 'number') {
        targetTimeRef.current = Date.now() + targetDate * 1000;
      }
      
      requestRef.current = requestAnimationFrame(updateTime);
    }
  };
  
  // Zatrzymanie odliczania
  const stop = () => {
    if (isRunningRef.current) {
      isRunningRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }
  };
  
  // Reset odliczania
  const reset = () => {
    stop();
    startTimeRef.current = null;
    targetTimeRef.current = null;
    previousTimeRef.current = undefined;
    
    // Zresetuj stan
    setTimeLeft(calculateTimeLeft());
    
    // Jeśli było automatyczne uruchomienie, uruchom ponownie
    if (autoStart) {
      start();
    }
  };
  
  // Efekt uruchamiający animację
  useEffect(() => {
    if (autoStart) {
      start();
    }
    
    // Czyszczenie przy odmontowaniu
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Efekt resetujący odliczanie przy zmianie targetDate
  useEffect(() => {
    reset();
  }, [targetDate]);
  
  return {
    ...timeLeft,
    isRunning: isRunningRef.current,
    start,
    stop,
    reset
  };
};

export default useCountdown;