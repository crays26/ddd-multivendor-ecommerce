export class ReserveStockCommand {
  constructor(
    public readonly payload: {
      variantId: string;
      quantity: number;
    },
  ) {}
}
