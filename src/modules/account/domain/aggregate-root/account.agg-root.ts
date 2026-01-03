import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { PasswordVO } from '../value-objects/password.vo';
import { EmailVO } from '../value-objects/email.vo';
import { v7 as uuidV7 } from 'uuid';
import { AccountLoggedInEvent } from '../events/account-logged-in.event';
import { AccountSignedUpEvent } from 'src/modules/account/domain/events/account-signed-up.event';
import { RoleIdVO } from 'src/modules/account/domain/value-objects/role-id.vo';
import { Address } from '../entities/address.entity';

interface AccountProps {
  id: string;
  username: string;
  email: EmailVO;
  password: PasswordVO;
  roles: RoleIdVO[];
  addresses: Address[];
}

interface CreateAccountProps {
  username: string;
  email: string;
  password: string;
  roles?: RoleIdVO[];
  addresses?: Address[];
}

export class AccountAggRoot extends AggregateRootBase<string, AccountProps> {
  private constructor(props: AccountProps) {
    super(props);
    this.validate(props);
  }

  private validate(props: AccountProps) {
    const defaultAddress: Address[] = [];
    props.addresses.forEach((address) => {
      if (address.isDefault()) defaultAddress.push(address);
    });
    if (defaultAddress.length > 1)
      throw new BadRequestException('Only one default address is allowed');

    const roleSet = new Set(props.roles.map((r) => r.getId()));
    if (roleSet.size !== props.roles.length)
      throw new BadRequestException('Duplicate role');

    const addressSet = new Set(props.addresses.map((a) => a.getId()));
    if (addressSet.size !== props.addresses.length)
      throw new BadRequestException('Duplicate address');
  }

  static create(props: CreateAccountProps): AccountAggRoot {
    const account = new AccountAggRoot({
      id: uuidV7(),
      username: props.username,
      email: EmailVO.create({ value: props.email }),
      password: PasswordVO.create({ value: props.password }),
      roles: props.roles ?? [],
      addresses: props.addresses ?? [],
    });
    account.apply(new AccountSignedUpEvent(account.id));
    return account;
  }

  static rehydrate(props: AccountProps): AccountAggRoot {
    return new AccountAggRoot(props);
  }

  public getUsername(): string {
    return this.props.username;
  }

  public getEmail(): string {
    return this.props.email.getValue();
  }

  public getPassword(): string {
    return this.props.password.getValue();
  }

  public getRoles(): RoleIdVO[] {
    return this.props.roles;
  }

  public getAddresses(): Address[] {
    return this.props.addresses;
  }

  public setUsername(newUsername: string): void {
    if (!newUsername || newUsername.length < 4) {
      throw new BadRequestException('Username must be at least 4 characters');
    }
    this.props.username = newUsername;
  }

  public setEmail(newEmail: string): void {
    this.props.email = EmailVO.create({ value: newEmail });
  }

  public setPassword(newPassword: string): void {
    this.props.password = PasswordVO.create({ value: newPassword });
  }

  public setAddresses(addresses: Address[]): void {
    this.props.addresses = addresses;
    this.validate(this.props);
  }

  public addAddress(address: Address): void {
    if (this.props.addresses.some((a) => a.getId() === address.getId()))
      throw new ConflictException('Address already exists');

    this.props.addresses.push(address);
  }

  public updateAddress(address: Address): void {
    const index = this.props.addresses.findIndex(
      (a) => a.getId() === address.getId(),
    );
    if (index === -1) {
      throw new NotFoundException('Address not found');
    }
    this.props.addresses[index] = address;
  }

  public setAddressDefault(addressId: string): void {
    if (!this.props.addresses.find((a) => a.getId() === addressId))
      throw new NotFoundException('Address not found');

    this.props.addresses.forEach((a) => {
      if (a.getId() === addressId) a.setAsDefault();
      else a.unsetDefault();
    });
  }

  public removeAddress(addressId: string): void {
    this.props.addresses = this.props.addresses.filter(
      (addr) => addr.getId() !== addressId,
    );
  }

  public addRole(newRole: RoleIdVO): void {
    if (this.props.roles.some((r) => r.getId() === newRole.getId()))
      throw new ConflictException('Role already exists');
    this.props.roles.push(newRole);
  }

  public logIn() {
    this.apply(new AccountLoggedInEvent(this.getId()));
  }
}
