import { IEntity } from "../services/api/api-core/api-core.service";

export interface IInventoryIncome extends IEntity<Number>{
  date: Date,
}
