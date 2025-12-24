import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { RoleName } from 'src/shared/auth/types/role.type';
import { v7 as uuidV7 } from 'uuid';

interface RoleProps {
  id: string;
  name: RoleName;
}

interface CreateRoleProps {
  id?: string;
  name: RoleName;
}

export class RoleAggRoot extends AggregateRootBase<string, RoleProps> {
  private constructor(props: RoleProps) {
    super(props);
  }

  static create(props: CreateRoleProps): RoleAggRoot {
    return new RoleAggRoot({
      id: props.id ?? uuidV7(),
      name: props.name,
    });
  }

  static rehydrate(props: RoleProps): RoleAggRoot {
    return new RoleAggRoot(props);
  }

  getName(): RoleName {
    return this.props.name;
  }
}




