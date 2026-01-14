export const EVENT_NAMES = {
  // Order events
  ORDER_CREATED: 'OrderCreatedEvent',
  ORDER_GROUP_CREATED: 'OrderGroupCreatedEvent',
  ORDER_SHIPPED: 'OrderShippedEvent',
  ORDER_CANCELLED: 'OrderCancelledEvent',

  // Payment events
  PAYMENT_SUCCEEDED: 'PaymentSucceededEvent',
  PAYMENT_FAILED: 'PaymentFailedEvent',

  // Product events
  PRODUCT_CREATED: 'ProductCreatedEvent',
  PRODUCT_UPDATED: 'ProductUpdatedEvent',

  // Account events
  ACCOUNT_SIGNED_UP: 'AccountSignedUpEvent',
  ACCOUNT_LOGGED_IN: 'AccountLoggedInEvent',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
