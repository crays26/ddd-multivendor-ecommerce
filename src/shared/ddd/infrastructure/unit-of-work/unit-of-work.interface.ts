import { EntityManager, TransactionOptions } from '@mikro-orm/postgresql';

export interface IUnitOfWork {
  getEntityManager(): EntityManager;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  transactional(
    fn: () => Promise<void>,
    options?: TransactionOptions,
  ): Promise<void>;
  getRepository<T>(repo: new (em: EntityManager) => T): T;
}

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');
