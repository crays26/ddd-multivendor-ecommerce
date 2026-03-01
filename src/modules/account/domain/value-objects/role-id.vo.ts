import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface RoleIdProps {
  id: string;
  name?: string;
}
export class RoleIdVO extends ValueObjectBase<RoleIdProps> {
  private constructor(props: RoleIdProps) {
    super(props);
  }

  static create(props: RoleIdProps): RoleIdVO {
    return new RoleIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getName(): string | undefined {
    return this.props.name;
  }
}
