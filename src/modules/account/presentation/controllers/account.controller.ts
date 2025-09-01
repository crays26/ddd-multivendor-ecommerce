import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { SignUpAccountDto } from '../dtos/SignUpAccount.dto';
import { LogInAccountDto } from '../dtos/LogInAccount.dto';
import { AccountDto } from '../dtos/response/account.response.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAccountCommand } from '../../application/commands/sign-up-account/command';
import { AuthService } from 'src/shared/auth/auth.service';
import { LogInAccountCommand } from '../../application/commands/log-in-account/command';
import { Response } from 'express';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt.required.guard';
import { JwtOptionalGuard } from 'src/shared/auth/guards/jwt.optional.guard';
import { JwtRefreshGuard } from 'src/shared/auth/guards/jwt.refresh.guard';
import { AuthPayload } from 'src/shared/auth/AuthPayload.interface';
import { CurrentUser } from 'src/shared/auth/current.user.decorator';
import { GetAccountOfCurrentUserQuery } from '../../application/queries/get-account-of-current-user/query';

@Controller('account')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  async signUpAccount(@Body() body: SignUpAccountDto) {
    const command = new SignUpAccountCommand(body);
    return await this.commandBus.execute(command);
  }

  @Post('log-in')
  async logInAccount(@Body() body: LogInAccountDto, @Res() response: Response) {
    const command = new LogInAccountCommand(body);
    const tokenPair =
      await this.commandBus.execute(command);

    this.authService.setAuthCookies(response, tokenPair);
    response.send(tokenPair);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokenPair(@CurrentUser() currentUser: AuthPayload, @Res() response: Response) {
    const payload = {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      roles: currentUser.roles,
    }
    const tokenPair = this.authService.generateTokens(payload);
    this.authService.setAuthCookies(response, tokenPair);
    response.send(tokenPair);
  }

  @Get('')
  @UseGuards(JwtRequiredGuard)
  async getCurrentUser(
    @CurrentUser() currentUser: AuthPayload | null,
  ): Promise<AccountDto | null> {
    console.log(currentUser);
    const query = new GetAccountOfCurrentUserQuery(currentUser!.id);
    return await this.queryBus.execute(query);
  }

  @Get('/optional')
  @UseGuards(JwtOptionalGuard)
  async getOptionalCurrentUser(
    @CurrentUser() currentUser: AuthPayload | null,
  ): Promise<AccountDto | null> {
    console.log(currentUser);
    if (!currentUser) return null;
    const query = new GetAccountOfCurrentUserQuery(currentUser!.id);
    return await this.queryBus.execute(query);
  }

  
}
