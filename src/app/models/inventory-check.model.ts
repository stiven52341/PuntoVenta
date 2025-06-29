import { IEntity } from "../services/api/api-core/api-core.service";

export interface IInventoryCheck extends IEntity<Number>{
  date: Date,
}
