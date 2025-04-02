import { Drop, Product, CartReservation } from '../types/drop';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DropValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'DropValidationError';
  }
}

export class CartValidationError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'CartValidationError';
  }
}

export class ValidationService {
  validateDrop(drop: Omit<Drop, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!drop.title || drop.title.trim().length === 0) {
      throw new DropValidationError('Drop title is required');
    }

    if (!drop.description || drop.description.trim().length === 0) {
      throw new DropValidationError('Drop description is required');
    }

    if (!drop.startDate || !(drop.startDate instanceof Date)) {
      throw new DropValidationError('Valid start date is required');
    }

    if (!drop.endDate || !(drop.endDate instanceof Date)) {
      throw new DropValidationError('Valid end date is required');
    }

    if (drop.endDate <= drop.startDate) {
      throw new DropValidationError('End date must be after start date');
    }

    if (!drop.products || drop.products.length === 0) {
      throw new DropValidationError('At least one product is required');
    }

    if (drop.maxConcurrentUsers < 1) {
      throw new DropValidationError('Maximum concurrent users must be at least 1');
    }

    // Validate each product
    drop.products.forEach((product, index) => {
      this.validateProduct(product, index);
    });

    // Validate settings
    this.validateDropSettings(drop.settings);
  }

  validateProduct(product: Product, index: number): void {
    if (!product.name || product.name.trim().length === 0) {
      throw new DropValidationError(`Product ${index + 1} name is required`);
    }

    if (!product.description || product.description.trim().length === 0) {
      throw new DropValidationError(`Product ${index + 1} description is required`);
    }

    if (product.price <= 0) {
      throw new DropValidationError(`Product ${index + 1} price must be greater than 0`);
    }

    if (product.quantity < 0) {
      throw new DropValidationError(`Product ${index + 1} quantity cannot be negative`);
    }

    if (!product.images || product.images.length === 0) {
      throw new DropValidationError(`Product ${index + 1} must have at least one image`);
    }

    if (product.variants) {
      product.variants.forEach((variant, variantIndex) => {
        this.validateProductVariant(variant, index, variantIndex);
      });
    }
  }

  validateProductVariant(variant: any, productIndex: number, variantIndex: number): void {
    if (!variant.name || variant.name.trim().length === 0) {
      throw new DropValidationError(
        `Variant ${variantIndex + 1} of product ${productIndex + 1} name is required`
      );
    }

    if (variant.price <= 0) {
      throw new DropValidationError(
        `Variant ${variantIndex + 1} of product ${productIndex + 1} price must be greater than 0`
      );
    }

    if (variant.quantity < 0) {
      throw new DropValidationError(
        `Variant ${variantIndex + 1} of product ${productIndex + 1} quantity cannot be negative`
      );
    }

    if (!variant.attributes || Object.keys(variant.attributes).length === 0) {
      throw new DropValidationError(
        `Variant ${variantIndex + 1} of product ${productIndex + 1} must have at least one attribute`
      );
    }
  }

  validateDropSettings(settings: any): void {
    if (settings.requirePreDeposit && settings.preDepositAmount <= 0) {
      throw new DropValidationError('Pre-deposit amount must be greater than 0 when required');
    }

    if (settings.maxItemsPerUser < 1) {
      throw new DropValidationError('Maximum items per user must be at least 1');
    }
  }

  validateCartReservation(reservation: Omit<CartReservation, 'id' | 'createdAt' | 'updatedAt'>): void {
    if (!reservation.dropId) {
      throw new CartValidationError('Drop ID is required');
    }

    if (!reservation.userId) {
      throw new CartValidationError('User ID is required');
    }

    if (!reservation.products || reservation.products.length === 0) {
      throw new CartValidationError('At least one product is required');
    }

    if (!reservation.expiresAt || !(reservation.expiresAt instanceof Date)) {
      throw new CartValidationError('Valid expiration date is required');
    }

    if (reservation.expiresAt <= new Date()) {
      throw new CartValidationError('Expiration date must be in the future');
    }

    reservation.products.forEach((item, index) => {
      if (!item.productId) {
        throw new CartValidationError(`Product ${index + 1} ID is required`);
      }

      if (item.quantity < 1) {
        throw new CartValidationError(`Product ${index + 1} quantity must be at least 1`);
      }
    });
  }
}

export const validationService = new ValidationService(); 