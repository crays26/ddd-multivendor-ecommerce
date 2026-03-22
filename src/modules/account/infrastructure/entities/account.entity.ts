import {
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
  Unique,
} from '@mikro-orm/core';
import { RoleEntity } from './role.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { Collection } from '@mikro-orm/core';
import { AddressEntity } from 'src/modules/account/infrastructure/entities/address.entity';

@Entity({ tableName: 'account' })
export class AccountEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  @Unique()
  email!: string;

  @Property()
  username!: string;

  @Property()
  password!: string;

  @OneToOne(() => VendorEntity, (vendor) => vendor.account, { nullable: true })
  vendor?: Rel<VendorEntity>;

  @ManyToMany(() => RoleEntity, (role) => role.accounts, {
    owner: true,
    joinColumn: 'account_id',
    inverseJoinColumn: 'role_id',
  })
  roles = new Collection<RoleEntity>(this);

  @OneToMany(() => AddressEntity, (address) => address.account, {
    orphanRemoval: true,
  })
  addresses = new Collection<AddressEntity>(this);
}
