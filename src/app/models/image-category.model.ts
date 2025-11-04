import { IEntity } from "../services/api/api-core/api-core.service"

export interface IImageCategory extends IEntity<Number>{
  data: string,
  idEmployee: number
}
