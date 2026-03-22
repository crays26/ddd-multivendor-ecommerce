import {
  Entity,
  ManyToOne,
  Opt,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';

@Entity({ tableName: 'address' })
export class AddressEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  fullName!: string;

  @Property()
  phoneNumber!: string;

  @Property()
  street!: string;

  @Property({ nullable: true })
  unit?: string;

  @Property({ nullable: true })
  ward?: string;

  @Property()
  city!: string;

  @Property()
  region!: string;

  @Property()
  postalCode!: string;

  @Property()
  countryCode!: string;

  @Property({ default: false })
  isDefault!: boolean & Opt;

  @Property()
  label!: string;

  @ManyToOne(() => AccountEntity)
  account!: Rel<AccountEntity>;
}
