import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/postgresql';
import { RoleEntity } from 'src/modules/account/infrastructure/entities/role.entity';
import { v7 as uuidV7 } from 'uuid';
export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const roles = [
      {
        id: uuidV7(),
        name: 'Customer',
      },
      {
        id: uuidV7(),
        name: 'Vendor',
      },
      {
        id: uuidV7(),
        name: 'Admin',
      },
    ];
    for (const role of roles) {
      const existRole: RoleEntity | null = await em.findOne(RoleEntity, {
        name: role.name,
      });
      if (!existRole) {
        em.create(RoleEntity, {
          id: role.id,
          name: role.name,
        });
      }
    }
  }
}
