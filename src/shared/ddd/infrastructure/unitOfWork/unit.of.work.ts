import { EntityManager } from '@mikro-orm/postgresql';
import { IUnitOfWork } from './unit.of.work.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitOfWork implements IUnitOfWork {
    
  constructor(private readonly em: EntityManager) {}

  public async begin(): Promise<void> {
    await this.em.begin();
  }

  public async commit(): Promise<void> {
    await this.em.commit();
  }

  public async rollback(): Promise<void> {
    await this.em.rollback();
  }
}
