export abstract class ValueObjectBase<Props> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  public getProps(): Props {
    return this.props;
  }
}
