import { Inject, Injectable } from '@nestjs/common';
import { RED_LOCK } from './providers/redlock.provider';
import Redlock from 'redlock';
import { Lock } from 'redlock';
import { IDistributedLock } from './distributed-lock.interface';

@Injectable()
export class RedLockService implements IDistributedLock<Lock> {
  constructor(
    @Inject(RED_LOCK)
    private readonly redlock: Redlock,
  ) {}

  async acquire(keys: string[], ttl: number): Promise<Lock> {
    return await this.redlock.acquire(keys, ttl);
  }

  async release(lock: Lock): Promise<void> {
    await this.redlock.release(lock);
  }

  async extend(lock: Lock, ttl: number): Promise<Lock> {
    return await this.redlock.extend(lock, ttl);
  }
}
