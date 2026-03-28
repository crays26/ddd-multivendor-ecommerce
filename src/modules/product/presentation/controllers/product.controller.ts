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
import { Body } from '@nestjs/common';
import { CreateProductCommand } from '../../application/commands/create-product/command';
import { ProductUpdateDto } from '../dtos/requests/product.update.dto';
import { UpdateProductCommand } from '../../application/commands/update-product/command';
import { GetProductByIdQuery } from 'src/modules/product/application/queries/get-product-by-id/query';
import { ProductDto } from '../dtos/responses/product.dto';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';
import { AuthPayload, VendorId } from 'src/shared/auth/types/auth-payload.type';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { GetVendorByAccountIdQuery } from 'src/modules/vendor/application/queries/get-vendor-by-account-id/query';
import { GetProductsByVendorId } from 'src/modules/product/application/queries/get-products-by-vendor-id/query';
import { GetProductsBySearchTermQuery } from 'src/modules/product/application/queries/get-products-by-search-term/query';
import { GetProductsBySearchTermDto } from 'src/modules/product/application/queries/get-products-by-search-term/dto';
import { PaginationQueryDto } from 'src/shared/ddd/application/dtos/pagination-query.dto';
import { PaginatedDto } from 'src/shared/ddd/application/dtos/paginated-response.dto';
import { RoleName } from 'src/shared/auth/types/role.type';
import { CreateProductDto } from '../../application/commands/create-product/dto';
import { UpdateProductDto } from '../../application/commands/update-product/dto';
import { GetProductBySlugDto } from '../../application/queries/get-product-by-slug/dto';
import { GetProductBySlugQuery } from '../../application/queries/get-product-by-slug/query';
import { CurrentVendor } from 'src/shared/auth/decorators/param-decorators/current-vendor.decorator';

@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles(RoleName.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Post()
  async createProduct(
    @CurrentVendor() currentVendorId: VendorId,
    @Body() body: CreateProductDto,
  ): Promise<string> {
    const command = new CreateProductCommand({
      ...body,
      vendorId: currentVendorId,
    });

    return await this.commandBus.execute(command);
  }

  @Get('search')
  async searchProducts(
    @Query('q') searchTerm: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedDto<GetProductsBySearchTermDto>> {
    return await this.queryBus.execute(
      new GetProductsBySearchTermQuery(searchTerm, pagination),
    );
  }

  @Get(':productId')
  async findProductById(
    @Param('productId') productId: string,
  ): Promise<ProductDto> {
    const query = new GetProductByIdQuery(productId);
    return await this.queryBus.execute(query);
  }

  @Roles(RoleName.VENDOR)
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

  @Get('/slug/:slug')
  async findProductBySlug(
    @Param('slug') slug: string,
  ): Promise<GetProductBySlugDto> {
    const query = new GetProductBySlugQuery(slug);
    return await this.queryBus.execute(query);
  }

  @Roles(RoleName.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Put(':productId')
  async updateProduct(
    @CurrentUser() currentUser: AuthPayload,
    @Param('productId') productId: string,
    @Body() body: UpdateProductDto,
  ): Promise<string | null> {
    const vendor = await this.queryBus.execute(
      new GetVendorByAccountIdQuery(currentUser.id),
    );
    if (!vendor) throw new BadRequestException('Vendor not found.');
    const command = new UpdateProductCommand({
      ...body,
      id: productId,
      vendorId: vendor!.id,
    });
    return await this.commandBus.execute(command);
  }
}
