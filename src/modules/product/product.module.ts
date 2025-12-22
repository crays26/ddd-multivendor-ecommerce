import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductEntity } from './infrastructure/entities/product.entity';
import { ProductVariantEntity } from './infrastructure/entities/product-variant.entity';
import { ProductAttributeEntity } from './infrastructure/entities/product-attribute.entity';
import { ProductRepository } from './infrastructure/repositories/product.repo';
import { ProductController } from './presentation/controllers/product.controller';
import { CreateProductCommandHandler } from './application/commands/create-product/handler';
import { UpdateProductCommandHandler } from './application/commands/update-product/handler';
import { GetProductByIdQueryHandler } from './application/queries/get-product-by-id/handler';
import { ProductReadRepository } from './infrastructure/repositories/product.read.repo';
import { GetProductsByVendorIdQueryHandler } from './application/queries/get-products-by-vendor-id/handler';
import { PRODUCT_PUBLIC_SERVICE } from 'src/modules/product/application/public-services/product.public-service.interface';
import { ProductPublicService } from 'src/modules/product/application/public-services/product.public-service';

const CommandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
];
const QueryHandlers = [
  GetProductByIdQueryHandler,
  GetProductsByVendorIdQueryHandler,
];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      ProductVariantEntity,
      ProductAttributeEntity,
    ]),
    CqrsModule,
  ],

  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_PUBLIC_SERVICE,
      useClass: ProductPublicService,
    },
    ProductRepository,
    ProductReadRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PRODUCT_PUBLIC_SERVICE],
})
export class ProductModule {}
