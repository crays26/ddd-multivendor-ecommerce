import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignUpAccountDto } from '../dtos/SignUpAccount.dto';
import { LogInAccountDto } from '../dtos/LogInAccount.dto';
import { AccountDto } from '../dtos/response/account.response.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAccountCommand } from '../../application/commands/sign-up-account/command';
import { AuthService } from 'src/shared/auth/auth.service';
import { LogInAccountCommand } from '../../application/commands/log-in-account/command';
import { Request, Response } from 'express';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { JwtOptionalGuard } from 'src/shared/auth/guards/jwt/jwt.optional.guard';
import { JwtRefreshGuard } from 'src/shared/auth/guards/jwt/jwt.refresh.guard';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { GetAccountByIdQuery } from 'src/modules/account/application/queries/get-account-by-id/query';
import { AddAddressDto } from 'src/modules/account/application/commands/add-address-to-account/dto';
import { AddAddressToAccountCommand } from 'src/modules/account/application/commands/add-address-to-account/command';

@Controller('account')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  async signUpAccount(@Body() body: SignUpAccountDto, req: Request) {
    const command = new SignUpAccountCommand(body);
    return await this.commandBus.execute(command);
  }

  @Post('log-in')
  async logInAccount(@Body() body: LogInAccountDto, @Res() response: Response) {
    const command = new LogInAccountCommand(body);
    const tokenPair = await this.commandBus.execute(command);

    this.authService.setAuthCookies(response, tokenPair);
    response.send(tokenPair);
  }

  @UseGuards(JwtRequiredGuard)
  @Post('log-out')
  async logOutAccount(@Req() request: Request, @Res() response: Response) {
    const tokenPair = {
      accessToken: request.cookies['access_token'],
      refreshToken: request.cookies['refresh_token'],
    };
    await this.authService.blacklistTokenPair(tokenPair);

    this.authService.clearAuthCookies(response);
    response.send('Logged out successfully');
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokenPair(
    @CurrentUser() currentUser: AuthPayload,
    @Res() response: Response,
  ) {
    const payload = {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      roles: currentUser.roles,
    };
    const tokenPair = this.authService.generateTokens(payload);
    this.authService.setAuthCookies(response, tokenPair);
    response.send(tokenPair);
  }

  @Get('')
  @UseGuards(JwtRequiredGuard)
  async getCurrentUser(
    @CurrentUser() currentUser: AuthPayload,
  ): Promise<AccountDto | null> {
    const query = new GetAccountByIdQuery(currentUser!.id);
    return await this.queryBus.execute(query);
  }

  @Get('/optional')
  @UseGuards(JwtOptionalGuard)
  async getOptionalCurrentUser(
    @CurrentUser() currentUser: AuthPayload | null,
  ): Promise<AccountDto | null> {
    console.log(currentUser);
    if (!currentUser) return null;
    const query = new GetAccountByIdQuery(currentUser!.id);
    return await this.queryBus.execute(query);
  }

  @Post('address')
  @UseGuards(JwtRequiredGuard)
  async addAddress(
    @CurrentUser() currentUser: AuthPayload,
    @Body() body: AddAddressDto,
  ): Promise<string> {
    const command = new AddAddressToAccountCommand(currentUser.id, body);
    return await this.commandBus.execute(command);
  }
}
