import { defineConfig } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt('5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'ddd_app',
  entities: ['dist/**/*.entity.js'], // CLI & production
  entitiesTs: ['src/**/*.entity.ts'], // Dev (NestJS runtime)
  migrations: {
    path: './dist/shared/ddd/infrastructure/database/migrations',
    pathTs: './src/shared/ddd/infrastructure/database/migrations',
  },
   seeder: {
    path: './dist/shared/ddd/infrastructure/database/seeders',
    pathTs: './src/shared/ddd/infrastructure/database/seeders',
    fileName: (className: string) => className, // seeder file naming convention
  },
  highlighter: new SqlHighlighter(),
  debug: process.env.NODE_ENV === 'dev',
  extensions: [Migrator, SeedManager],
});
