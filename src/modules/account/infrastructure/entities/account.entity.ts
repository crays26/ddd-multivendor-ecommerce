import { Entity, ManyToMany, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Role } from './role.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { Collection } from '@mikro-orm/core';

@Entity({ tableName: 'account' })
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

   @OneToOne(() => VendorEntity, vendor => vendor.account, { nullable: true })
   vendor?: VendorEntity;

   @ManyToMany(() => Role, role => role.accounts, { owner: true }) 
   roles = new Collection<Role>(this);


}