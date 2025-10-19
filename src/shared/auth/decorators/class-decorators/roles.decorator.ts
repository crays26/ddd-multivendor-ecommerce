import { SetMetadata } from "@nestjs/common";
import {RoleId} from "src/shared/auth/types/role.type";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleId[]) => SetMetadata(ROLES_KEY, roles);