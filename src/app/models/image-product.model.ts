import { IEntity } from "../services/api/api-core/api-core.service"

export interface IImageProduct extends IEntity<Number>{
  data: string;
  idEmployee: number
}
