import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductCreateDto } from '../dtos/requests/product.create.dto';
import { Body } from '@nestjs/common';
import { CreateProductCommand } from '../../application/commands/create-product/command';
import { ProductUpdateDto } from '../dtos/requests/product.update.dto';
import { UpdateProductCommand } from '../../application/commands/update-product/command';
import { GetProductByIdQuery } from '../../application/queries/queries/get-product-by-id/query';
import { ProductDto } from '../dtos/responses/product.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createProduct(@Body() body: ProductCreateDto): Promise<string> {
    const command = new CreateProductCommand(body);
    return await this.commandBus.execute(command);
  }

  @Get(':productId')
  async findProductById(@Param('productId') productId: string): Promise<ProductDto> {
    const query = new GetProductByIdQuery(productId);
    return await this.queryBus.execute(query)
  }

  @Put(':productId')
  async updateProduct(@Param('productId') productId: string, @Body() body: ProductUpdateDto): Promise<string | null> {
    const command = new UpdateProductCommand({ ...body, id: productId });
    return await this.commandBus.execute(command);
  }
}
