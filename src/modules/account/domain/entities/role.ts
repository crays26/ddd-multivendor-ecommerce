import { BaseEntity } from 'src/shared/ddd/domain/base/BaseEntity';
import { v7 as uuidV7 } from 'uuid';
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
      id: props.id ? props.id : uuidV7(),
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
