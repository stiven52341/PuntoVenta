import { IEntity } from "../services/api/api-core/api-core.service"

export interface IProductCategory extends IEntity<{
    idProduct: number,
    idCategory: number
  }>{
    idEmployee: number
}
