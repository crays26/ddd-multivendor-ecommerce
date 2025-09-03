import { Controller, Param, Post, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ProductCreateDto } from '../dtos/requests/product.create.dto';
import { Body } from '@nestjs/common';
import { CreateProductCommand } from '../../application/commands/create-product/command';
import { ProductUpdateDto } from '../dtos/requests/product.update.dto';
import { UpdateProductCommand } from '../../application/commands/update-product/command';

@Controller('products')
export class ProductController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createProduct(@Body() body: ProductCreateDto) {
    const command = new CreateProductCommand(body);
    return await this.commandBus.execute(command);
  }

  @Put('/:productId')
  async updateProduct(@Param('productId') productId: string, @Body() body: ProductUpdateDto) {
    const command = new UpdateProductCommand({ ...body, id: productId });
    return await this.commandBus.execute(command);
  }
}
