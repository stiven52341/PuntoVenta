import { IProduct } from "./product.model";
import { IUnitProduct } from "./unit-product.model";

export interface ICart{
  id: number,
  products: Array<{product: IProduct, unit: IUnitProduct, amount: number}>,
  state: boolean
}
