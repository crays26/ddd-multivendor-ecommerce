export const EVENT_NAMES = {
  // Order events
  ORDER_CREATED: 'OrderCreatedEvent',
  CHECKOUT_CREATED: 'CheckoutCreatedEvent',
  ORDER_SHIPPED: 'OrderShippedEvent',
  ORDER_CANCELLED: 'OrderCancelledEvent',

  // Payment events
  PAYMENT_SUCCEEDED: 'PaymentSucceededEvent',
  PAYMENT_FAILED: 'PaymentFailedEvent',

  // Inventory events
  STOCK_RESERVED: 'StockReservedEvent',
  STOCK_CONFIRMATION_FAILED: 'StockConfirmationFailedEvent',
  INSUFFICIENT_STOCK: 'InsufficientStockEvent',

  // Product events
  PRODUCT_CREATED: 'ProductCreatedEvent',
  PRODUCT_UPDATED: 'ProductUpdatedEvent',

  // Account events
  ACCOUNT_SIGNED_UP: 'AccountSignedUpEvent',
  ACCOUNT_LOGGED_IN: 'AccountLoggedInEvent',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
