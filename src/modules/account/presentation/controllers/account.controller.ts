import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AccountRepository } from '../../infrastructure/repositories/account.repo';
import { CreateAccountDto } from '../dtos/CreateAccount.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AccountDto } from '../dtos/AccountResponse.dto';
import { wrap } from '@mikro-orm/postgresql';
import { CommandBus } from '@nestjs/cqrs';
import { SignUpAccountCommandHandler } from '../../application/commands/sign-up-account/handler';
import { SignUpAccountCommand } from '../../application/commands/sign-up-account/command';


@Controller('account')
export class AuthController {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Post()
  async signUpAccount(@Body() body: CreateAccountDto) {
    
    const command = new SignUpAccountCommand(body.email, body.username, body.password);
    return await this.commandBus.execute(command);
  }

  @Get()
  async findAll() {
    const accounts = await this.accountRepo.findAll();

    return accounts;
  }

  @Get('books')
  async findBooks() {
    return await this.accountRepo.findBooks();
  }
}
