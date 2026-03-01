import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { AccountEntity } from './account.entity';
import { ManyToMany } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity({ tableName: 'role' })
export class RoleEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Unique()
  @Property()
  name!: string;

  @ManyToMany(() => AccountEntity, (account) => account.roles)
  accounts = new Collection<AccountEntity>(this);
}
