import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { AccountRepository } from '../repositories/account.repo';
import { EntityRepositoryType } from '@mikro-orm/core';
import { Account } from './account.entity';
import { ManyToOne } from '@mikro-orm/core';
import { serialize } from 'v8';

@Entity()
export class Book {

   @PrimaryKey()
   id!: number;

   @Property()
   name!: string;

   
  @ManyToOne(() => Account ) 
  account!: Account;
}