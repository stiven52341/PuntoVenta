import { IEntity } from "../services/api/api-core/api-core.service";

export interface IProduct extends IEntity<Number>{
  name: string,
  baseUnit: number,
  category?: string,
  description?: string,
}
