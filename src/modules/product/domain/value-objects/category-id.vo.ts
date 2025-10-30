import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface CategoryIdProps {
  id: string;
}

export class CategoryIdVO extends ValueObjectBase<CategoryIdProps> {
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
