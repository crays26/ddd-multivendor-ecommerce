export interface IDistributedLock {
  acquire(keys: string[], ttl: number): Promise<any>;
  release(lock: any): Promise<void>;
  extend(lock: any, ttl: number): Promise<any>;
}
