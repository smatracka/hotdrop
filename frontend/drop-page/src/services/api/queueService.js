/**
 * Serwis do obsługi systemu kolejkowego
 * Zarządza stanem kolejki, komunikacją z backendem i powiadomieniami
 */
import api from '../api/api';

class QueueService {
  constructor() {
    this.queueStatus = null;
    this.refreshInterval = null;
    this.listeners = [];
    this.refreshRate = 10000; // 10 sekund
  }
  
  /**
   * Inicjalizacja serwisu kolejki dla dropu
   * @param {string} dropId - ID dropu
   * @returns {Promise<Object>} Status kolejki
   */
  async initialize(dropId) {
    this.dropId = dropId;
    return this.checkStatus();
  }
  
  /**
   * Sprawdzenie statusu kolejki
   * @returns {Promise<Object>} Status kolejki
   */
  async checkStatus() {
    try {
      const response = await api.get(`/drops/${this.dropId}/queue/status`);
      this.queueStatus = response.data.data;
      this.notifyListeners();
      return this.queueStatus;
    } catch (error) {
      console.error('Error checking queue status:', error);
      throw new Error('Nie udało się sprawdzić statusu kolejki.');
    }
  }
  
  /**
   * Rozpoczęcie regularnego odświeżania statusu
   */
  startRefreshing() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(async () => {
      try {
        await this.checkStatus();
        
        // Jeśli użytkownik już nie jest w kolejce, zatrzymaj odświeżanie
        if (!this.queueStatus.inQueue) {
          this.stopRefreshing();
        }
      } catch (error) {
        console.error('Error refreshing queue status:', error);
      }
    }, this.refreshRate);
  }
  
  /**
   * Zatrzymanie odświeżania statusu
   */
  stopRefreshing() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
  
  /**
   * Dodanie słuchacza zmian statusu
   * @param {Function} listener - Funkcja wywoływana przy zmianie statusu
   */
  addListener(listener) {
    this.listeners.push(listener);
  }
  
  /**
   * Usunięcie słuchacza zmian statusu
   * @param {Function} listener - Funkcja do usunięcia
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * Powiadomienie wszystkich słuchaczy o zmianie statusu
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.queueStatus);
      } catch (error) {
        console.error('Error notifying queue listener:', error);
      }
    });
  }
  
  /**
   * Dołączenie do kolejki
   * @returns {Promise<Object>} Status kolejki
   */
  async joinQueue() {
    try {
      const response = await api.post(`/drops/${this.dropId}/queue/join`);
      this.queueStatus = response.data.data;
      this.notifyListeners();
      
      // Rozpocznij odświeżanie statusu
      this.startRefreshing();
      
      return this.queueStatus;
    } catch (error) {
      console.error('Error joining queue:', error);
      throw new Error('Nie udało się dołączyć do kolejki.');
    }
  }
  
  /**
   * Opuszczenie kolejki
   * @returns {Promise<Object>} Potwierdzenie operacji
   */
  async leaveQueue() {
    try {
      const response = await api.post(`/drops/${this.dropId}/queue/leave`);
      this.queueStatus = null;
      this.stopRefreshing();
      this.notifyListeners();
      return response.data.data;
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw new Error('Nie udało się opuścić kolejki.');
    }
  }
  
  /**
   * Sprawdzenie czy użytkownik jest w kolejce
   * @returns {boolean} Czy użytkownik jest w kolejce
   */
  isInQueue() {
    return this.queueStatus && this.queueStatus.inQueue;
  }
  
  /**
   * Pobranie aktualnej pozycji w kolejce
   * @returns {number} Pozycja w kolejce
   */
  getPosition() {
    return this.queueStatus ? this.queueStatus.position : 0;
  }
  
  /**
   * Pobranie szacowanego czasu oczekiwania
   * @returns {number} Czas oczekiwania w sekundach
   */
  getEstimatedWaitTime() {
    return this.queueStatus ? this.queueStatus.estimatedWaitTime : 0;
  }
  
  /**
   * Zniszczenie serwisu (czyszczenie interwałów, itp.)
   */
  destroy() {
    this.stopRefreshing();
    this.listeners = [];
    this.queueStatus = null;
  }
}

// Eksport singletonu
export default new QueueService();