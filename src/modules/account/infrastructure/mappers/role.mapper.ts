import { RoleAggRoot } from '../../domain/aggregate-root/role.agg-root';
import { RoleEntity } from '../entities/role.entity';
import { RoleName } from 'src/shared/auth/types/role.type';

export class RoleDomainMapper {
  static fromPersistence(entity: RoleEntity): RoleAggRoot {
    return RoleAggRoot.rehydrate({
      id: entity.id,
      name: entity.name as RoleName,
    });
  }

  static toPersistence(domain: RoleAggRoot): RoleEntity {
    const entity = new RoleEntity();
    entity.id = domain.getId();
    entity.name = domain.getName();
    return entity;
  }
}




