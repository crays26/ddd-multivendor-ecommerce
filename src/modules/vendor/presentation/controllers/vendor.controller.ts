import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';
import { Role } from 'src/shared/auth/enums/role.enum';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { AuthPayload } from 'src/shared/auth/AuthPayload.interface';
import { CurrentUser } from 'src/shared/auth/current.user.decorator';
import { VendorCreateDto } from 'src/modules/vendor/presentation/dtos/requests/vendor.create.dto';
import { CreateVendorCommand } from 'src/modules/vendor/application/commands/create-vendor/command';

@Controller('vendors')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Post()
  async createVendor(
    @CurrentUser() user: AuthPayload,
    @Body() body: VendorCreateDto,
  ): Promise<string> {
    const payload = {
      ...body,
      accountId: user.id,
    };
    const command = new CreateVendorCommand(payload);
    return await this.commandBus.execute(command);
  }

  // @Get(':productId')
  // async findProductById(
  //     @Param('productId') productId: string,
  // ): Promise<ProductDto> {
  //     const query = new GetProductByIdQuery(productId);
  //     return await this.queryBus.execute(query);
  // }
  //
  // @Roles(Role.VENDOR)
  // @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  // @Put(':productId')
  // async updateProduct(
  //     @Param('productId') productId: string,
  //     @Body() body: ProductUpdateDto,
  // ): Promise<string | null> {
  //     const command = new UpdateProductCommand({ ...body, id: productId });
  //     return await this.commandBus.execute(command);
  // }
}
