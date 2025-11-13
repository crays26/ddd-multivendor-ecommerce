import { Entity, ManyToMany, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { RoleEntity } from './role.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { Collection } from '@mikro-orm/core';

@Entity({ tableName: 'account' })
export class AccountEntity {

   @PrimaryKey({ type: 'uuid' })
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

   @ManyToMany(() => RoleEntity, role => role.accounts, { owner: true })
   roles = new Collection<RoleEntity>(this);


}