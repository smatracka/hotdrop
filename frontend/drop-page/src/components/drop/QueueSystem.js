import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './QueueSystem.css';

/**
 * Komponent systemu kolejkowego
 * Wyświetla informacje o pozycji w kolejce i szacowanym czasie oczekiwania
 */
const QueueSystem = ({ 
  position, 
  queueLength, 
  estimatedWaitTime,
  onQueueComplete,
  refreshInterval = 10000,
  className = ''
}) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [remainingTime, setRemainingTime] = useState(estimatedWaitTime);
  const [progress, setProgress] = useState(calculateProgress());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Obliczenie procentowego postępu w kolejce
  function calculateProgress() {
    if (queueLength <= 0 || currentPosition <= 0) return 100;
    const maxProgress = 95; // Maksymalny procent przed wejściem (zostawiamy 5% na animację końcową)
    const progressValue = ((queueLength - currentPosition) / queueLength) * maxProgress;
    return Math.min(Math.max(0, progressValue), maxProgress);
  }
  
  // Odświeżanie statusu kolejki
  const refreshQueueStatus = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // W prawdziwej implementacji tutaj byłoby zapytanie do API
      // Tutaj symulujemy postęp w kolejce poprzez zmniejszanie pozycji
      const newPosition = Math.max(0, currentPosition - 1);
      const newRemainingTime = Math.max(0, remainingTime - (refreshInterval / 1000));
      
      setCurrentPosition(newPosition);
      setRemainingTime(newRemainingTime);
      
      // Jeśli pozycja dotarła do 0, użytkownik może wejść na stronę dropu
      if (newPosition === 0 && onQueueComplete) {
        onQueueComplete();
      }
    } catch (error) {
      console.error('Błąd podczas odświeżania statusu kolejki:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Aktualizacja paska postępu
  useEffect(() => {
    setProgress(calculateProgress());
  }, [currentPosition, queueLength]);
  
  // Ustawienie interwału odświeżania
  useEffect(() => {
    // Nie odświeżamy, jeśli już jesteśmy na początku kolejki
    if (currentPosition <= 0) {
      if (onQueueComplete) onQueueComplete();
      return;
    }
    
    const intervalId = setInterval(refreshQueueStatus, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [currentPosition, refreshInterval]);
  
  // Formatowanie czasu oczekiwania
  const formatWaitTime = (seconds) => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)} sekund`;
    }
    
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minutę' : minutes < 5 ? 'minuty' : 'minut'}`;
  };
  
  return (
    <div className={`queue-system ${className}`}>
      <div className="queue-card">
        <h2 className="queue-title">Jesteś w kolejce</h2>
        <p className="queue-description">
          Ze względu na duże zainteresowanie dropem, wprowadziliśmy system kolejkowy. 
          Prosimy o cierpliwość, wkrótce uzyskasz dostęp do dropu.
        </p>
        
        <div className="queue-progress-container">
          <div className="queue-progress">
            <div 
              className="queue-progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="queue-details">
            <div className="queue-position">
              <span className="queue-label">Twoja pozycja:</span>
              <span className="queue-value">{currentPosition}</span>
            </div>
            
            <div className="queue-total">
              <span className="queue-label">Osób w kolejce:</span>
              <span className="queue-value">{queueLength}</span>
            </div>
          </div>
        </div>
        
        <div className="queue-wait-time">
          <div className="queue-wait-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="queue-wait-text">
            <div className="queue-wait-label">Szacowany czas oczekiwania:</div>
            <div className="queue-wait-value">{formatWaitTime(remainingTime)}</div>
          </div>
        </div>
        
        <p className="queue-tip">
          Strona odświeży się automatycznie, gdy przyjdzie Twoja kolej.
          Nie odświeżaj strony, aby nie stracić miejsca w kolejce.
        </p>
        
        <div className="queue-refreshing">
          {isRefreshing ? 'Aktualizowanie statusu...' : ''}
        </div>
      </div>
    </div>
  );
};

QueueSystem.propTypes = {
  position: PropTypes.number.isRequired,
  queueLength: PropTypes.number.isRequired,
  estimatedWaitTime: PropTypes.number.isRequired,
  onQueueComplete: PropTypes.func,
  refreshInterval: PropTypes.number,
  className: PropTypes.string
};

export default QueueSystem;