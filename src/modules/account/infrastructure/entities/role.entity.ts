import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { AccountRepository } from '../repositories/account.repo';
import { EntityRepositoryType } from '@mikro-orm/core';
import { Account } from './account.entity';
import { ManyToOne } from '@mikro-orm/core';
import { serialize } from 'v8';
import { ManyToMany } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity()
export class Role {

   @PrimaryKey()
   id!: string;

   @Property()
   name!: string;

  @ManyToMany(() => Account, account => account.roles)
  accounts = new Collection<Account>(this);
}