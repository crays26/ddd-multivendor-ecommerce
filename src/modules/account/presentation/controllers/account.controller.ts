import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AccountRepository } from '../../infrastructure/repositories/account.repo';
import { SignUpAccountDto } from '../dtos/SignUpAccount.dto';
import { LogInAccountDto } from '../dtos/LogInAccount.dto';
import { AccountDto } from '../dtos/response/account.response.dto';
import { wrap } from '@mikro-orm/postgresql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAccountCommandHandler } from '../../application/commands/sign-up-account/handler';
import { SignUpAccountCommand } from '../../application/commands/sign-up-account/command';
import { AuthService } from 'src/shared/auth/auth.service';
import { LogInAccountCommand } from '../../application/commands/log-in-account/command';
import { Response } from 'express';
import {
  OptionalAuthGuard,
  RequiredAuthGuard,
} from 'src/shared/auth/auth.guard';
import { AuthPayload } from 'src/shared/auth/AuthPayload';
import { CurrentUser } from 'src/shared/auth/currentUser.decorator';
import { GetAccountOfCurrentUserQuery } from '../../application/queries/get-account-of-current-user/query';

@Controller('account')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('sign-up')
  async signUpAccount(@Body() body: SignUpAccountDto) {
    const command = new SignUpAccountCommand(body);
    return await this.commandBus.execute(command);
  }

  @Post('log-in')
  async logInAccount(@Body() body: LogInAccountDto, @Res() response: Response) {
    const command = new LogInAccountCommand(body);
    const { accessToken, refreshToken } =
      await this.commandBus.execute(command);

    response
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 14 * 24 * 60 * 60 * 1000,
      })
      .send({ accessToken, refreshToken });
  }

  @Get('')
  @UseGuards(RequiredAuthGuard)
  async getCurrentUser(@CurrentUser() currentUser: AuthPayload | null): Promise<AccountDto | null> {
    
    console.log(currentUser);
    const query = new GetAccountOfCurrentUserQuery(currentUser!.id);
    return await this.queryBus.execute(query);
  }
}
