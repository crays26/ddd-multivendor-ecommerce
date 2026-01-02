import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { RoleAggRoot } from '../aggregate-root/role.agg-root';
import { RoleName } from 'src/shared/auth/types/role.type';

export interface IRoleRepository extends BaseRepository<RoleAggRoot> {
  findById(id: string): Promise<RoleAggRoot | null>;
  findByName(name: RoleName): Promise<RoleAggRoot | null>;
  findByIds(ids: string[]): Promise<RoleAggRoot[]>;
}

export const ROLE_REPO = Symbol('ROLE_REPO');





