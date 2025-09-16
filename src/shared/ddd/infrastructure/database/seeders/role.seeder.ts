import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/postgresql';
import { Role } from 'src/modules/account/infrastructure/entities/role.entity';
export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const roles = [
      {
        id: process.env.ROLE_CUSTOMER_ID as string,
        name: 'Customer',
      },
      {
        id: process.env.ROLE_VENDOR_ID as string,
        name: 'Vendor',
      },
      {
        id: process.env.ROLE_ADMIN_ID as string,
        name: 'Admin',
      },
    ];
    // will get persisted automatically
    for (const role of roles) {
        const existRole: Role | null = await em.findOne(Role, { id: role.id })
        if (!existRole) {
            em.create(Role, {
                id: role.id,
                name: role.name
            });
        }
    }

    // but if you would do `const author = new Author()` instead,
    // you would need to call `em.persist(author)` explicitly.
  }
}
