import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule, CommandHandler } from '@nestjs/cqrs';
import { ProductEntity } from './infrastructure/entities/Product.entity';
import { ProductVariantEntity } from './infrastructure/entities/ProductVariant.entity';
import { ProductAttributeEntity } from './infrastructure/entities/ProductAttribute.entity';
import { ProductRepository } from './infrastructure/repositories/product.repo';
import { ProductController } from './presentation/controllers/product.controller';
import { CreateProductCommandHandler } from './application/commands/create-product/handler';
import { UpdateProductCommandHandler } from './application/commands/update-product/handler';
import { GetAccountOfCurrentUserQueryHandler } from '../account/application/queries/get-account-of-current-user/handler';
import { GetProductByIdQueryHandler } from './application/queries/queries/get-product-by-id/handler';
import { ProductReadRepository } from './infrastructure/repositories/product.read.repo';

const CommandHandlers = [CreateProductCommandHandler, UpdateProductCommandHandler]
const QueryHandlers = [GetProductByIdQueryHandler]

@Module({
  imports: [
    MikroOrmModule.forFeature([ProductEntity, ProductVariantEntity, ProductAttributeEntity]),
    CqrsModule,
  ],

  controllers: [ProductController],
  providers: [
    ProductRepository,
    ProductReadRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class ProductModule {}
