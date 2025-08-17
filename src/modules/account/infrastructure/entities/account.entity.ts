import { Cascade, Entity, ManyToMany, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Role } from './role.entity';
import { Collection } from '@mikro-orm/core';

@Entity()
export class Account {

   @PrimaryKey()
   id!: string;

   @Property()
   @Unique()
   email!: string;

   @Property()
   username!: string;

  
   @Property()
   password!: string;

   @ManyToMany(() => Role, role => role.accounts, { owner: true }) 
   roles = new Collection<Role>(this);


}