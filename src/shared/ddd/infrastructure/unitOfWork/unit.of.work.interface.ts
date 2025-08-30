export interface IUnitOfWork {
    begin(): void;
    commit(): void;
    rollback(): void;
}