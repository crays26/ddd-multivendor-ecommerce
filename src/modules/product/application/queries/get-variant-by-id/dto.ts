import { Expose, Type } from 'class-transformer';

export class GetVariantByIdDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  skuCode: string;

  @Expose()
  stock: number;

  @Expose()
  price: number;

  @Expose()
  @Type(() => AssociatedAttribute)
  associatedAttributes: AssociatedAttribute[];
}

class AssociatedAttribute {
  @Expose()
  key: string;

  @Expose()
  value: string;
}
