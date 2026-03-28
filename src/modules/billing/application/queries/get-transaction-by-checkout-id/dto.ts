import { Expose } from 'class-transformer';

export class GetTransactionByCheckoutIdDto {
  @Expose()
  id: string;

  @Expose()
  checkoutId: string;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  provider: string;

  @Expose()
  status: string;

  @Expose()
  providerIntentId?: string;

  @Expose()
  clientSecret?: string;

  @Expose()
  paymentMethod?: string;
}
