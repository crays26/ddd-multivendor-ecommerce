import { RoleName } from 'src/shared/auth/types/role.type';

export type AuthPayload = {
  id: string;
  username: string;
  email: string;
  roles: RoleName[];
}
