import { IEntity } from "../services/api/api-core/api-core.service";

export interface ICategory extends IEntity<Number>{
  name: string,
  description?: string,
  idEmployee: number
}
