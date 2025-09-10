import { Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductCreateDto } from '../dtos/requests/product.create.dto';
import { Body } from '@nestjs/common';
import { CreateProductCommand } from '../../application/commands/create-product/command';
import { ProductUpdateDto } from '../dtos/requests/product.update.dto';
import { UpdateProductCommand } from '../../application/commands/update-product/command';
import { GetProductByIdQuery } from '../../application/queries/queries/get-product-by-id/query';
import { ProductDto } from '../dtos/responses/product.dto';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';
import { Role } from 'src/shared/auth/enums/role.enum';

@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles(Role.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
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

  
  @Roles(Role.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Put(':productId')
  async updateProduct(@Param('productId') productId: string, @Body() body: ProductUpdateDto): Promise<string | null> {
    const command = new UpdateProductCommand({ ...body, id: productId });
    return await this.commandBus.execute(command);
  }
}
