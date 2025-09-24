import { BadRequestException } from '@nestjs/common';
import { BaseAggregateRoot } from 'src/shared/ddd/domain/base/BaseAggregateRoot';
import { v7 as uuidV7 } from 'uuid';
import { AccountId } from '../value-objects/account-id.vo';


interface VendorProps {
  id: string;
  name: string;
  description: string;
  accountId: AccountId;
  rating: number;
}

interface CreateVendorProps {
  id?: string;
  name: string;
  description: string;
  accountId: string;
}

export class VendorAggRoot extends BaseAggregateRoot<
  string,
  VendorProps
> {
  private constructor(props: VendorProps) {
    super(props);
  }

  static create(props: CreateVendorProps): VendorAggRoot {
    return new VendorAggRoot({
      id: props.id ? props.id : uuidV7(),
      name: props.name,
      description: props.description,
      accountId: AccountId.create({ id: props.accountId }),
      rating: 0,
    });
  }

//   static rehydrate(props: AccountProps): AccountDomainEntity {
//     return new AccountDomainEntity(props);
//   }


  public getName(): string {
    return this.props.name;
  }

  public getDescription(): string {
    return this.props.description;
  }

  public getAccountId(): string {
    return this.props.accountId.getId();
  }

  public getRating(): number {
    return this.props.rating;
  }


  public setName(newName: string): void {
    if (!newName || newName.length < 4) {
      throw new BadRequestException('Name must be at least 4 characters');
    }
    this.props.name = newName;
  }

  public setDescription(newDescription: string): void {
    this.props.description = newDescription;
  }

  public setRating(newRating: number): void {
    this.props.rating = newRating;
  }
}
