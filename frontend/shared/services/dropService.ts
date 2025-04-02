import { Drop, DropPage, DropQueue, CartReservation } from '../types/drop';
import { v4 as uuidv4 } from 'uuid';
import { validationService, ValidationError } from './validationService';
import { apiService } from './apiService';

class DropService {
  // Drop Management
  async createDrop(drop: Omit<Drop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Drop> {
    try {
      // Validate drop data
      validationService.validateDrop(drop);

      const dropId = uuidv4();
      const now = new Date();
      
      const newDrop: Drop = {
        ...drop,
        id: dropId,
        createdAt: now,
        updatedAt: now,
      };

      // Save to backend
      const savedDrop = await apiService.createDrop(newDrop);

      // Create drop page
      await this.createDropPage(dropId, drop.title);

      // Initialize queue
      await this.initializeQueue(dropId, drop.maxConcurrentUsers);

      return savedDrop;
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to create drop: ${error.message}`);
      }
      throw new Error('Failed to create drop: Unknown error');
    }
  }

  async updateDrop(dropId: string, updates: Partial<Drop>): Promise<Drop> {
    try {
      const drop = await this.getDrop(dropId);
      const updatedDrop = {
        ...drop,
        ...updates,
        updatedAt: new Date(),
      };

      // Validate updated drop data
      validationService.validateDrop(updatedDrop);

      return await apiService.updateDrop(dropId, updates);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to update drop: ${error.message}`);
      }
      throw new Error('Failed to update drop: Unknown error');
    }
  }

  async getDrop(dropId: string): Promise<Drop> {
    try {
      return await apiService.getDrop(dropId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get drop: ${error.message}`);
      }
      throw new Error('Failed to get drop: Unknown error');
    }
  }

  // Drop Page Management
  private async createDropPage(dropId: string, title: string): Promise<DropPage> {
    try {
      const slug = this.generateSlug(title);
      const dropPage: DropPage = {
        id: uuidv4(),
        dropId,
        slug,
        content: {
          hero: {
            title,
            subtitle: 'Limited Edition Drop',
            backgroundImage: '',
          },
          description: '',
          features: [],
          countdown: {
            enabled: true,
            title: 'Drop Starts In',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to backend
      return await apiService.createDropPage(dropPage);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create drop page: ${error.message}`);
      }
      throw new Error('Failed to create drop page: Unknown error');
    }
  }

  // Queue Management
  private async initializeQueue(dropId: string, maxConcurrentUsers: number): Promise<DropQueue> {
    try {
      const queue: DropQueue = {
        dropId,
        currentUsers: 0,
        maxConcurrentUsers,
        queue: [],
        activeUsers: [],
        lastUpdated: new Date(),
      };

      // Save to backend
      return await apiService.initializeQueue(queue);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize queue: ${error.message}`);
      }
      throw new Error('Failed to initialize queue: Unknown error');
    }
  }

  private async getQueue(dropId: string): Promise<DropQueue> {
    try {
      return await apiService.getQueue(dropId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get queue: ${error.message}`);
      }
      throw new Error('Failed to get queue: Unknown error');
    }
  }

  private async updateQueue(dropId: string, queue: DropQueue): Promise<void> {
    try {
      await apiService.updateQueue(dropId, queue);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to update queue: ${error.message}`);
      }
      throw new Error('Failed to update queue: Unknown error');
    }
  }

  async joinQueue(dropId: string, userId: string): Promise<boolean> {
    try {
      return await apiService.joinQueue(dropId, userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to join queue: ${error.message}`);
      }
      throw new Error('Failed to join queue: Unknown error');
    }
  }

  async leaveQueue(dropId: string, userId: string): Promise<void> {
    try {
      await apiService.leaveQueue(dropId, userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to leave queue: ${error.message}`);
      }
      throw new Error('Failed to leave queue: Unknown error');
    }
  }

  // Cart Reservation
  async createCartReservation(
    dropId: string,
    userId: string,
    products: CartReservation['products']
  ): Promise<CartReservation> {
    try {
      const reservation: CartReservation = {
        id: uuidv4(),
        dropId,
        userId,
        products,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate reservation data
      validationService.validateCartReservation(reservation);

      return await apiService.createCartReservation(dropId, userId, products);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to create cart reservation: ${error.message}`);
      }
      throw new Error('Failed to create cart reservation: Unknown error');
    }
  }

  private async getCartReservation(reservationId: string): Promise<CartReservation> {
    try {
      return await apiService.getCartReservation(reservationId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get cart reservation: ${error.message}`);
      }
      throw new Error('Failed to get cart reservation: Unknown error');
    }
  }

  async updateCartReservation(
    reservationId: string,
    status: CartReservation['status']
  ): Promise<CartReservation> {
    try {
      const reservation = await this.getCartReservation(reservationId);
      const updatedReservation = {
        ...reservation,
        status,
        updatedAt: new Date(),
      };

      return await apiService.updateCartReservation(reservationId, status);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to update cart reservation: ${error.message}`);
      }
      throw new Error('Failed to update cart reservation: Unknown error');
    }
  }

  // Utility Methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export const dropService = new DropService(); 