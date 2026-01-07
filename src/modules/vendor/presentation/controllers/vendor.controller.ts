import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { CurrentUser } from 'src/shared/auth/current.user.decorator';
import { VendorCreateDto } from 'src/modules/vendor/presentation/dtos/requests/vendor.create.dto';
import { CreateVendorCommand } from 'src/modules/vendor/application/commands/create-vendor/command';
import { RoleName } from 'src/shared/auth/types/role.type';

@Controller('vendors')
export class VendorController {
  constructor(private readonly commandBus: CommandBus) {}

  @Roles(RoleName.CUSTOMER)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Post()
  async createVendor(
    @CurrentUser() user: AuthPayload,
    @Body() body: VendorCreateDto,
  ) {
    const command = new CreateVendorCommand({ ...body, accountId: user.id });
    return await this.commandBus.execute(command);
  }
}
