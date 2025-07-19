import { AggregateRoot } from "@nestjs/cqrs";
import { randomUUID, UUID } from "crypto";
class AccountDomainEntity extends AggregateRoot {
    private id: UUID;
    private name: string;
    constructor(id: UUID, name: string) {
        super();
        this.id = id;
        this.name = name;
    }

    

}