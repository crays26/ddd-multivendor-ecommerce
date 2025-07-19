import { Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { AccountRepository } from '../repositories/account.repo';
import { EntityRepositoryType } from '@mikro-orm/core';
import { Book } from './book.entity';
import { Collection } from '@mikro-orm/core';

@Entity()
export class Account {

   @PrimaryKey()
   id!: number;

   @Property()
   username!: string;

   @Property()
   email!: string;

   @Property({ hidden: true })
   password!: string;

   @OneToMany(() => Book, book => book.account) // referenced entity type can be sniffer too
   books = new Collection<Book>(this);


}