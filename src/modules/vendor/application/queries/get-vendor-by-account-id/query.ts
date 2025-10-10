import {Query} from "@nestjs/cqrs";
import {VendorDto} from "src/modules/vendor/presentation/dtos/responses/vendor.dto";

export class GetVendorByAccountIdQuery extends Query<VendorDto | null> {
    constructor(public readonly accountId: string) {
        super();
    }
}