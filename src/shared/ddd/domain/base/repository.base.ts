export interface BaseRepository<T> {
    findById(id: string): Promise<T | null>;
    insert(domain: T): Promise<void>;
    update(domain: T): Promise<void>;
}