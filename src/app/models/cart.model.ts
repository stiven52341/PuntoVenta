import { IProductCart } from "../pages/cart/cart.page";
import { IEntity } from "../services/api/api-core/api-core.service";

export interface ICart extends IEntity<Number>{
  id: number,
  products: Array<IProductCart>
}
