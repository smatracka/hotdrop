export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  variants?: ProductVariant[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  quantity: number;
  attributes: Record<string, string>;
}

export interface Drop {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'past';
  products: Product[];
  maxConcurrentUsers: number;
  settings: DropSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface DropSettings {
  requirePreDeposit: boolean;
  preDepositAmount: number;
  maxItemsPerUser: number;
  queueEnabled: boolean;
  allowMultipleOrders: boolean;
}

export interface DropPage {
  id: string;
  dropId: string;
  slug: string;
  content: {
    hero: {
      title: string;
      subtitle: string;
      backgroundImage: string;
    };
    description: string;
    features: string[];
    countdown: {
      enabled: boolean;
      title: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DropQueue {
  dropId: string;
  currentUsers: number;
  maxConcurrentUsers: number;
  queue: string[]; // Array of user IDs
  activeUsers: string[]; // Array of user IDs currently in the drop
  lastUpdated: Date;
}

export interface CartReservation {
  id: string;
  dropId: string;
  userId: string;
  products: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  expiresAt: Date;
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
} 