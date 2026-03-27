import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
  Unique,
} from '@mikro-orm/core';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';

@Entity({ tableName: 'billing_customer' })
export class BillingCustomerEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @OneToOne(() => AccountEntity, { owner: true, unique: true })
  account!: Rel<AccountEntity>;

  @Property({ nullable: true })
  @Unique()
  providerCustomerId?: string;

  @Property({ nullable: true })
  defaultPaymentMethodId?: string;
}
