import { States } from "./constants"

export interface IProductCategory{
  id: {
    idProduct: number,
    idCategory: number
  },
  state: boolean,
  uploaded: States
}
