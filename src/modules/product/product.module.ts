import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductEntity } from './infrastructure/entities/Product.entity';
import { ProductVariantEntity } from './infrastructure/entities/ProductVariant.entity';
import { ProductAttributeEntity } from './infrastructure/entities/ProductAttribute.entity';


@Module({
  imports: [
    MikroOrmModule.forFeature([ProductEntity, ProductVariantEntity, ProductAttributeEntity]),
    CqrsModule,
  ],

  controllers: [],
  providers: [
    // AccountRepository,
    // AuthService,
    // ...CommandHandlers,
    // ...QueryHandlers,
  ],
  exports: [],
})
export class ProductModule {}
