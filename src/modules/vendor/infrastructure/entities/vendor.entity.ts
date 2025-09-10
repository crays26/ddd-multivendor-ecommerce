import { Entity, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Account } from 'src/modules/account/infrastructure/entities/account.entity';

@Entity({ tableName: 'vendor' })
export class VendorEntity {

   @PrimaryKey()
   id!: string;

   @Property()
   @Unique()
   name!: string;

   @Property()
   @Unique()
   slug!: string;

   @Property({ type: 'text' })
   description!: string;

   @Property({ type: 'double precision' })
   rating!: number;

   @OneToOne(() => Account, account => account.vendor, { owner: true })
   account!: Account;
}