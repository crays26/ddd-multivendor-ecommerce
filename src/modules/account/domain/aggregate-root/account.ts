import { BadRequestException } from "@nestjs/common";
import { randomUUID, UUID } from "crypto";
import { BaseAggregateRoot } from "src/shared/domain/base/BaseAggregateRoot";
import { PasswordVO } from "../value-objects/password.vo";
import { EmailVO } from "../value-objects/email.vo";
import { v4 } from "uuid";

interface AccountProps {
  id: string;
  username: string;
  email: EmailVO;
  password: PasswordVO;
}

interface CreateAccountProps {
  username: string;
  email: string;
  password: string;
}

export class AccountDomainEntity extends BaseAggregateRoot<string, AccountProps> {
  private constructor(props: AccountProps) {
    super(props);
  }

  static create(props: CreateAccountProps): AccountDomainEntity {
    const account = new AccountDomainEntity({
      id: v4(),
      username: props.username,
      email: EmailVO.create(props.email),
      password: PasswordVO.create(props.password),
    });

    return account;
  }

  // GETTERS
  public getId(): string {
    return this.props.id;
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

  // SETTERS / DOMAIN BEHAVIORS
  public updateUsername(newUsername: string): void {
    if (!newUsername || newUsername.length < 4) {
      throw new BadRequestException('Username must be at least 4 characters');
    }
    this.props.username = newUsername;
  }

  public updateEmail(newEmail: string): void {
    this.props.email = EmailVO.create(newEmail);
  }

  public updatePassword(newPassword: string): void {
    this.props.password = PasswordVO.create(newPassword);
  }
}
