import {Expose} from "class-transformer";

export class VendorDto {

    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    slug: string;

    @Expose()
    description: string;

    @Expose()
    accountId: string;
}