export interface BaseRepository<T> {
    findById(id: string): Promise<T | null>;
    insert(domain: T): Promise<T>;
    update(domain: T): Promise<T>;
}