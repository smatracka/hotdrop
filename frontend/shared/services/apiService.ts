import { Drop, DropPage, DropQueue, CartReservation } from '../types/drop';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response;
  }

  // Drop Management
  async getDrops(sellerId: string): Promise<Drop[]> {
    const response = await this.fetchWithAuth(`/drops/seller/${sellerId}`);
    return response.json();
  }

  async getDrop(id: string): Promise<Drop> {
    const response = await this.fetchWithAuth(`/drops/${id}`);
    return response.json();
  }

  async createDrop(drop: Omit<Drop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Drop> {
    const response = await this.fetchWithAuth('/drops', {
      method: 'POST',
      body: JSON.stringify(drop),
    });
    return response.json();
  }

  async updateDrop(id: string, updates: Partial<Drop>): Promise<Drop> {
    const response = await this.fetchWithAuth(`/drops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async publishDrop(id: string): Promise<Drop> {
    const response = await this.fetchWithAuth(`/drops/${id}/publish`, {
      method: 'POST',
    });
    return response.json();
  }

  async deleteDrop(id: string): Promise<void> {
    await this.fetchWithAuth(`/drops/${id}`, {
      method: 'DELETE',
    });
  }

  // Drop Page Management
  async createDropPage(dropPage: Omit<DropPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<DropPage> {
    const response = await this.fetchWithAuth(`/drops/${dropPage.dropId}/pages`, {
      method: 'POST',
      body: JSON.stringify(dropPage),
    });
    return response.json();
  }

  // Queue Management
  async getQueue(dropId: string): Promise<DropQueue> {
    const response = await this.fetchWithAuth(`/drops/${dropId}/queue`);
    return response.json();
  }

  async initializeQueue(queue: Omit<DropQueue, 'id' | 'createdAt' | 'updatedAt'>): Promise<DropQueue> {
    const response = await this.fetchWithAuth(`/drops/${queue.dropId}/queue`, {
      method: 'POST',
      body: JSON.stringify(queue),
    });
    return response.json();
  }

  async updateQueue(dropId: string, queue: Partial<DropQueue>): Promise<DropQueue> {
    const response = await this.fetchWithAuth(`/drops/${dropId}/queue`, {
      method: 'PUT',
      body: JSON.stringify(queue),
    });
    return response.json();
  }

  async joinQueue(dropId: string, userId: string): Promise<boolean> {
    const response = await this.fetchWithAuth(`/drops/${dropId}/queue/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }

  async leaveQueue(dropId: string, userId: string): Promise<void> {
    await this.fetchWithAuth(`/drops/${dropId}/queue/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Cart Reservation
  async createCartReservation(
    dropId: string,
    userId: string,
    products: CartReservation['products']
  ): Promise<CartReservation> {
    const response = await this.fetchWithAuth(`/drops/${dropId}/cart-reservations`, {
      method: 'POST',
      body: JSON.stringify({ userId, products }),
    });
    return response.json();
  }

  async getCartReservation(reservationId: string): Promise<CartReservation> {
    const response = await this.fetchWithAuth(`/drops/cart-reservations/${reservationId}`);
    return response.json();
  }

  async updateCartReservation(
    reservationId: string,
    status: CartReservation['status']
  ): Promise<CartReservation> {
    const response = await this.fetchWithAuth(`/drops/cart-reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.json();
  }
}

export const apiService = new ApiService(); 