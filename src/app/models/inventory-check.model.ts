import { IEntity } from "../services/api/api-core/api-core.service";
import { IInventoryCheckDetail } from "./inventory-check-detail.model";

export interface IInventoryCheck extends IEntity<Number>{
  date: Date,
  details: Array<IInventoryCheckDetail>,
  idEmployee: number
}
