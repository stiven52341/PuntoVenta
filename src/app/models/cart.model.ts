import { IProductCart } from "../pages/cart/cart.page";
import { States } from "./constants";

export interface ICart{
  id: number,
  products: Array<IProductCart>,
  state: boolean,
  uploaded: States
}
