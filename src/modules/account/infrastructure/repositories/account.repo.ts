// account.repository.ts
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, UuidType, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';

import { Book } from '../entities/book.entity';
import { AccountDto } from '../../presentation/dtos/AccountResponse.dto';
import { plainToInstance } from 'class-transformer';
import { AccountDomainEntity } from '../../domain/aggregate-root/account';
import { UUID } from 'crypto';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repo: EntityRepository<Account>,
    private readonly em: EntityManager,
  ) {}

  async create(domain: AccountDomainEntity) {
    const account = new Account();
    account.id = domain.getId();
    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();
    await this.em.persistAndFlush(account);
    
    return account;
    
  }

  async findBooks() {
    const books = await this.em.findOneOrFail(Book, 1);
    console.log("books: ", books);
    console.log(wrap(books.account).toObject());

    console.log("book.account.id: ", books.account.id);
    console.log(books.account.email);
    const wrappedBooks = wrap(books).toObject();
    
    console.log("wrapperd books: ", wrappedBooks, wrappedBooks.account.email);
    return {
      books,
      wrappedBooks 
    }
  };

  async createNewBook(data: {name: string, account: string}) {
    const book = new Book();
    book.name = data.name;
    book.account = this.em.getReference(Account, data.account);
    await this.em.persistAndFlush(book);
    await wrap(book.account).init();
    wrap(book.account).assign({
      username: "Wrapped assign"
    })
    return book.account;
    
  }

  async findById(id: UUID): Promise<Account | null> {
    const userSchema = await this.repo.findOne({ id });
    if (!userSchema) return null;

    return {
      id: userSchema.id,
      username: userSchema.username,
      email: userSchema.email,
      password: userSchema.password,
      books: userSchema.books
    };
  }
  
  async findAll() {
    const accounts = await this.repo.findAll({ populate: ['books'] });
    console.log(accounts);
    console.log("accounts.books:", accounts.map(a => a.books));
    console.log("accounts.books.getItems()", accounts.map(a => a.books.getItems()))
    const wrappedAccount = wrap(accounts).toObject();
    console.log(wrappedAccount)
    
    
    return plainToInstance(AccountDto, wrappedAccount, { excludeExtraneousValues: true });
  }
}
