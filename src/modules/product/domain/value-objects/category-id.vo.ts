import { BaseValueObject } from 'src/shared/ddd/domain/base/BaseValueObject';

interface CategoryIdProps {
  id: string;
}

export class CategoryIdVO extends BaseValueObject<CategoryIdProps> {
  private constructor(props: CategoryIdProps) {
    super(props);
  }

  static create(props: CategoryIdProps): CategoryIdVO {
    return new CategoryIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
