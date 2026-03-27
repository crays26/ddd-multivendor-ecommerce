import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
  Unique,
} from '@mikro-orm/core';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';

@Entity({ tableName: 'billing_vendor' })
export class BillingVendorEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @OneToOne(() => VendorEntity, { owner: true, unique: true })
  vendor!: Rel<VendorEntity>;

  @Property({ nullable: true })
  @Unique()
  providerAccountId?: string;
}
