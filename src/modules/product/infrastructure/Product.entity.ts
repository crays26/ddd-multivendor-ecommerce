import { Cascade, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity()
export class ProductEntity {

   @PrimaryKey()
   id!: number;

   @Property()
   name!: string;

   @Property()
   slug!: string;

   @Property()
   password!: string;


}