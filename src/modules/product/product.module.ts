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

const CommandHandlers = [CreateProductCommandHandler, UpdateProductCommandHandler]

@Module({
  imports: [
    MikroOrmModule.forFeature([ProductEntity, ProductVariantEntity, ProductAttributeEntity]),
    CqrsModule,
  ],

  controllers: [ProductController],
  providers: [
    ProductRepository,
    // AccountRepository,
    // AuthService,
    ...CommandHandlers,
    // ...QueryHandlers,
  ],
  exports: [],
})
export class ProductModule {}
