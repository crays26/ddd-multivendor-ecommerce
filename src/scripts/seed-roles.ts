// scripts/seed-roles.ts
import { bootstrapApp } from './bootstrap';
import { Role } from '../../src/modules/account/infrastructure/entities/role.entity';


async function seed() {
  const { app, orm } = await bootstrapApp();
  const em = orm.em.fork(); // get a clean EntityManager

  const roles = ['Admin', 'customer', 'Vendor'];

  for (const roleName of roles) {
    const exists = await em.findOne(Role, { name: roleName });
    if (!exists) {
      const role = new Role();
      role.name = roleName;
      em.persist(role);
    }
  }

  await em.flush();
  console.log('✅ Seeded roles successfully');
  await app.close();
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
