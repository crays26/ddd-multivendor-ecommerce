import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { RoleEntity } from '../entities/role.entity';
import { RoleAggRoot } from '../../domain/aggregate-root/role.agg-root';
import { IRoleRepository } from '../../domain/repositories/role.repo.interface';
import { RoleDomainMapper } from '../mappers/role.mapper';
import { RoleName } from 'src/shared/auth/types/role.type';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly em: EntityManager) {}

  async insert(domain: RoleAggRoot): Promise<void> {
    const entity = RoleDomainMapper.toPersistence(domain);
    this.em.persist(entity);
  }

  async update(): Promise<void> {
    return;
  }

  async findById(id: string): Promise<RoleAggRoot | null> {
    const entity = await this.em.findOne(RoleEntity, { id });
    if (!entity) return null;
    return RoleDomainMapper.fromPersistence(entity);
  }

  async findByIds(ids: string[]): Promise<RoleAggRoot[]> {
    if (ids.length === 0) return [];
    const entities: RoleEntity[] = await this.em.find(RoleEntity, { id: { $in: ids } });
    return entities.map(RoleDomainMapper.fromPersistence);
  }

  async findByName(name: RoleName): Promise<RoleAggRoot | null> {
    const entity = await this.em.findOne(RoleEntity, { name });
    if (!entity) return null;
    return RoleDomainMapper.fromPersistence(entity);
  }
}




