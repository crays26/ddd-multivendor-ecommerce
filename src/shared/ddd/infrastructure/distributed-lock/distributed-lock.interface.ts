export interface IDistributedLock<TLock> {
    acquire(keys: string[], ttl: number): Promise<TLock>;
    release(lock: TLock): Promise<void>;
    extend(lock: TLock, ttl: number): Promise<TLock>;
}