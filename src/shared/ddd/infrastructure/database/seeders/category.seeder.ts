import { Seeder } from '@mikro-orm/seeder';
import { v7 as uuidv7 } from 'uuid';
import { CategoryEntity } from 'src/modules/product/infrastructure/entities/category.entity';
import { EntityManager } from '@mikro-orm/postgresql';

export class CategorySeeder extends Seeder {
  async run(em: EntityManager) {
    async function createCategory(
      name: string,
      parent?: CategoryEntity | null,
    ) {
      const isExist: CategoryEntity | null = await em.findOne(CategoryEntity, {
        name,
      });
      if (isExist) return;
      const category = em.create(CategoryEntity, {
        id: uuidv7(),
        name,
        parentCategory: parent,
      });

      return category;
    }

    // ROOT
    const electronics = await createCategory('Electronics');
    const fashion = await createCategory('Fashion');
    const homeKitchen = await createCategory('Home & Kitchen');
    const books = await createCategory('Books');

    // ELECTRONICS
    const phones = await createCategory('Phones', electronics);
    const laptops = await createCategory('Laptops', electronics);
    const cameras = await createCategory('Cameras', electronics);

    const smartphones = await createCategory('Smartphones', phones);
    await createCategory('Android Phones', smartphones);
    await createCategory('iPhones', smartphones);
    await createCategory('Feature Phones', phones);

    const gamingLaptops = await createCategory('Gaming Laptops', laptops);
    await createCategory('Ultrabooks', laptops);

    await createCategory('DSLR', cameras);
    await createCategory('Mirrorless', cameras);

    // FASHION
    const menClothing = await createCategory('Men Clothing', fashion);
    const womenClothing = await createCategory('Women Clothing', fashion);

    await createCategory('Tops', menClothing);
    await createCategory('Bottoms', menClothing);
    createCategory('Dresses', womenClothing);
    createCategory('Accessories', womenClothing);

    // HOME & KITCHEN
    const furniture = await createCategory('Furniture', homeKitchen);
    const appliances = await createCategory('Appliances', homeKitchen);

    await createCategory('Living Room', furniture);
    await createCategory('Bedroom', furniture);
    await createCategory('Kitchen Appliances', appliances);
    await createCategory('Cleaning Appliances', appliances);

    // BOOKS
    const fiction = await createCategory('Fiction', books);
    const nonFiction = await createCategory('Non-fiction', books);

    await createCategory('Mystery', fiction);
    await createCategory('Fantasy', fiction);
    await createCategory('Self-Help', nonFiction);
    await createCategory('Biography', nonFiction);

    console.log("Category seeded successfully!");
  }
}
