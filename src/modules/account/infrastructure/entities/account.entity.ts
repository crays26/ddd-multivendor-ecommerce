import { Cascade, Entity, OneToMany, PrimaryKey, Property, UuidType } from '@mikro-orm/core';
import { AccountRepository } from '../repositories/account.repo';
import { EntityRepositoryType } from '@mikro-orm/core';
import { Book } from './book.entity';
import { Collection } from '@mikro-orm/core';
import { UUID } from 'crypto';

@Entity()
export class Account {

   @PrimaryKey()
   id!: string;

   @Property()
   username!: string;

   @Property()
   email!: string;

   @Property({ hidden: true })
   password!: string;

   @OneToMany(() => Book, book => book.account, {cascade: [Cascade.PERSIST] }) // referenced entity type can be sniffer too
   books = new Collection<Book>(this);


}