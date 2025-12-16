import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductCreateDto } from '../dtos/requests/product.create.dto';
import { Body } from '@nestjs/common';
import { CreateProductCommand } from '../../application/commands/create-product/command';
import { ProductUpdateDto } from '../dtos/requests/product.update.dto';
import { UpdateProductCommand } from '../../application/commands/update-product/command';
import { GetProductByIdQuery } from 'src/modules/product/application/queries/get-product-by-id/query';
import { ProductDto } from '../dtos/responses/product.dto';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';
import { RoleList } from 'src/shared/auth/types/role.type';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { GetVendorByAccountIdQuery } from 'src/modules/vendor/application/queries/get-vendor-by-account-id/query';
import { GetProductsByVendorId } from 'src/modules/product/application/queries/get-products-by-vendor-id/query';
import { PaginationQueryDto } from 'src/shared/ddd/application/dtos/pagination-query.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles(RoleList.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Post()
  async createProduct(
    @CurrentUser() currentUser: AuthPayload,
    @Body() body: ProductCreateDto,
  ): Promise<string> {
    const vendor = await this.queryBus.execute(
      new GetVendorByAccountIdQuery(currentUser.id),
    );
    console.log(vendor);
    if (!vendor) throw new BadRequestException('Vendor not found.');
    const command = new CreateProductCommand({ ...body, vendorId: vendor!.id });
    console.log(command);
    return await this.commandBus.execute(command);
  }

  @Get(':productId')
  async findProductById(
    @Param('productId') productId: string,
  ): Promise<ProductDto> {
    const query = new GetProductByIdQuery(productId);
    return await this.queryBus.execute(query);
  }

  @Roles(RoleList.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Get('vendors/:vendorId')
  async findProductsByVendorId(
    @Param('vendorId') vendorId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return await this.queryBus.execute(
      new GetProductsByVendorId(vendorId, pagination),
    );
  }

  @Roles(RoleList.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Put(':productId')
  async updateProduct(
    @CurrentUser() currentUser: AuthPayload,
    @Param('productId') productId: string,
    @Body() body: ProductUpdateDto,
  ): Promise<string | null> {
    const vendor = await this.queryBus.execute(
      new GetVendorByAccountIdQuery(currentUser.id),
    );
    const command = new UpdateProductCommand({
      ...body,
      id: productId,
      vendorId: vendor!.id,
    });
    return await this.commandBus.execute(command);
  }
}
