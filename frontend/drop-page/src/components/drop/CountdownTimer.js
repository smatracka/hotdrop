import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useCountdown from '../../hooks/useCountdown';
import './CountdownTimer.css';

/**
 * Komponent odliczania czasu do dropu
 * Wykorzystuje hook useCountdown dla lepszej wydajności i dokładności
 */
const CountdownTimer = ({
  targetDate,
  onComplete,
  size = 'medium', // small, medium, large
  className = ''
}) => {
  // Użyj hooka useCountdown do odliczania
  const countdown = useCountdown(targetDate, onComplete);
  
  // Klasy CSS dla różnych rozmiarów
  const timerClasses = [
    'countdown-timer',
    `countdown-timer--${size}`,
    countdown.expired ? 'countdown-timer--expired' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Formatowanie dwucyfrowe
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };
  
  return (
    <div className={timerClasses}>
      {!countdown.expired ? (
        <div className="countdown-timer-content">
          <div className="countdown-timer-units">
            <div className="timer-unit">
              <div className="timer-value">{countdown.days}</div>
              <div className="timer-label">dni</div>
            </div>
            
            <div className="timer-separator">:</div>
            
            <div className="timer-unit">
              <div className="timer-value">{formatNumber(countdown.hours)}</div>
              <div className="timer-label">godz</div>
            </div>
            
            <div className="timer-separator">:</div>
            
            <div className="timer-unit">
              <div className="timer-value">{formatNumber(countdown.minutes)}</div>
              <div className="timer-label">min</div>
            </div>
            
            <div className="timer-separator">:</div>
            
            <div className="timer-unit">
              <div className="timer-value">{formatNumber(countdown.seconds)}</div>
              <div className="timer-label">sek</div>
            </div>
          </div>
          
          {size !== 'small' && (
            <div className="countdown-timer-target">
              <span>Data dropu: </span>
              <time dateTime={new Date(targetDate).toISOString()}>
                {new Date(targetDate).toLocaleString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
            </div>
          )}
        </div>
      ) : (
        <div className="countdown-timer-expired">
          <div className="timer-expired-text">Drop rozpoczęty!</div>
          <div className="timer-refresh-hint">
            Odświeżamy stronę...
          </div>
        </div>
      )}
    </div>
  );
};

CountdownTimer.propTypes = {
  targetDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]).isRequired,
  onComplete: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

export default CountdownTimer;