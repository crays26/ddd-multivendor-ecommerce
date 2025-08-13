// scripts/bootstrap.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { MikroORM } from '@mikro-orm/core';

export async function bootstrapApp() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const orm = app.get(MikroORM);
  return { app, orm };
}
