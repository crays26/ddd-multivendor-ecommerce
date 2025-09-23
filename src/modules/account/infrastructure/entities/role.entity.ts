import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Account } from './account.entity';
import { ManyToMany } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity({ tableName: 'role' })
export class Role {

   @PrimaryKey({ type: 'uuid' })
   id!: string;

   @Property()
   name!: string;

  @ManyToMany(() => Account, account => account.roles)
  accounts = new Collection<Account>(this);
}