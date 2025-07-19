import { Body, ClassSerializerInterceptor, Controller, Get, Post, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { AccountRepository } from '../../infrastructure/repositories/account.repo';
import { CreateAccountDto } from '../dtos/CreateAccount.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AccountDto } from '../dtos/AccountResponse.dto';
import { wrap } from '@mikro-orm/postgresql';

@Controller('auth')
export class AuthController {
    constructor(private readonly accountRepo: AccountRepository) {}

  @Get()
  async findAll() {
    const accounts = await this.accountRepo.findAll();
    
    return accounts;
    
  }

  @Get('books')
  async findBooks() {
    return await this.accountRepo.findBooks();
    
  }

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto) {
    return await this.accountRepo.createNew(createAccountDto);

  }

  @Post('books')
  async createBook(@Body() data: { name: string, account: number }) {
    return await this.accountRepo.createNewBook(data);

  }
}
