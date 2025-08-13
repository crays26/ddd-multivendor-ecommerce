export class SignUpAccountCommand  {
  constructor(
    public readonly data: {
      readonly email: string;
      readonly username: string;
      readonly password: string;
    },
  ) {}
}
