// account.repository.ts
import { InjectEntityManager, InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { CreateAccountDto, CreateBookDto } from '../../presentation/dtos/CreateAccount.dto';
import { Book } from '../entities/book.entity';
import { AccountDto, BookDto } from '../../presentation/dtos/AccountResponse.dto';
import { plainToInstance } from 'class-transformer';
//test 
@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repo: EntityRepository<Account>,
     @InjectRepository(Book)
    private readonly bookRepo: EntityRepository<Book>,
    
    private readonly em: EntityManager,
  ) {}

  async createNew(data: CreateAccountDto & { books: CreateBookDto[] }) {
    const account = new Account();
    account.username = data.username;
    account.email = data.email;
    account.password = data.password;
    account.books.set(data.books);

    await this.em.persistAndFlush(account);

    console.log(account.id);
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

  async createNewBook(data: {name: string, account: number}) {
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

  async findById(id: number): Promise<Account | null> {
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
    const accounts = await this.repo.findOneOrFail(1, { populate: ['books'] });
    console.log(accounts);
    console.log("accounts.books:", accounts.books)
    console.log("accounts.books.getItems()", accounts.books.getItems())
    const wrappedAccount = wrap(accounts).toObject();
    console.log(wrappedAccount)
    const account = await this.repo.findOneOrFail(1); 
    const dto = wrap(account).toObject();
    
    return plainToInstance(AccountDto, wrappedAccount, { excludeExtraneousValues: true });
  }
}
