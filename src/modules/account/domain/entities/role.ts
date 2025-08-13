import { BaseEntity } from 'src/shared/domain/base/BaseEntity';
import { v4 } from 'uuid';
interface RoleProps {
  id: string;
  name: string;
}

interface CreateRoleProps {
  id?: string;
  name: string;
}

export class RoleDomainEntity extends BaseEntity<string, RoleProps> {
  private constructor(props: RoleProps) {
    super(props);
  }

  static create(props: CreateRoleProps): RoleDomainEntity {
    const role = new RoleDomainEntity({
      id: props.id ? props.id : v4(),
      name: props.name,
    });

    return role;
  }

  // GETTERS
  public getId(): string {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  // SETTERS / DOMAIN BEHAVIORS
  public setName(newName: string): void {
    this.props.name = newName;
  }
}
