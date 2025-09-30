import { Lock } from "redlock";

export interface IDistributedLock {
  
  acquire(keys: string[], ttl: number): Promise<Lock>;
  release(lock: Lock): Promise<void>;
  extend(lock: Lock, ttl: number): Promise<Lock>;
}
