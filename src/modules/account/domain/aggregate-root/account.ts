import { BadRequestException } from '@nestjs/common';
import { BaseAggregateRoot } from 'src/shared/ddd/domain/base/BaseAggregateRoot';
import { PasswordVO } from '../value-objects/password.vo';
import { EmailVO } from '../value-objects/email.vo';
import { v7 as uuidV7 } from 'uuid';
import { RoleDomainEntity } from '../entities/role';

interface AccountProps {
  id: string;
  username: string;
  email: EmailVO;
  password: PasswordVO;
  roles: RoleDomainEntity[];
}

interface CreateAccountProps {
  id?: string;
  username: string;
  email: string;
  password: string;
  roles?: RoleDomainEntity[];
}

export class AccountDomainEntity extends BaseAggregateRoot<
  string,
  AccountProps
> {
  private constructor(props: AccountProps) {
    super(props);
  }

  static create(props: CreateAccountProps): AccountDomainEntity {
    const account = new AccountDomainEntity({
      id: props.id ? props.id : uuidV7(),
      username: props.username,
      email: EmailVO.create({value: props.email }),
      password: PasswordVO.create({ value: props.password }),
      roles: props.roles ? props.roles : [],
    });

    return account;
  }

  static rehydrate(props: AccountProps): AccountDomainEntity {
    return new AccountDomainEntity(props);
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

  public getRoles(): RoleDomainEntity[] {
    return this.props.roles;
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
}
