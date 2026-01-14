export const QUEUE_NAMES = {
  ORDER_QUEUE: 'order-queue',
  PAYMENT_QUEUE: 'payment-queue',
  INVENTORY_QUEUE: 'inventory-queue',
  PRODUCT_QUEUE: 'product-queue',
  ACCOUNT_QUEUE: 'account-queue',
  NOTIFICATION_QUEUE: 'notification-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
