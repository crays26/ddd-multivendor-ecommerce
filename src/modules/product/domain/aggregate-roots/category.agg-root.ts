import { BaseAggregateRoot } from 'src/shared/ddd/domain/base/BaseAggregateRoot';
import { v7 as uuidV7 } from 'uuid';

interface CategoryProps {
  id: string;
  name: string;
  parentCategoryId: string | null;
}

interface CreateCategoryProps {
  name: string;
  parentCategoryId?: string;
}

export class CategoryAggRoot extends BaseAggregateRoot<string, CategoryProps> {
  private constructor(props: CategoryProps) {
    super(props);
  }

  public static create(props: CreateCategoryProps): CategoryAggRoot {
    return new CategoryAggRoot({
      id: uuidV7(),
      name: props.name,
      parentCategoryId: props.parentCategoryId ?? null,
    });
  }

  public static rehydrate(props: CategoryProps): CategoryAggRoot {
    return new CategoryAggRoot(props);
  }

  public getName(): string {
      return this.props.name;
  }

  public getParentCategoryId(): string | null {
      return this.props.parentCategoryId;
  }

  public setName(name: string): void {
      this.props.name = name;
  }
  public setParentCategoryId(categoryId: string): void {
      this.props.parentCategoryId = categoryId;
  }
}
