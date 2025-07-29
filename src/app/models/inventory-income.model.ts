import { IEntity } from "../services/api/api-core/api-core.service";
import { IInventoryIncomeDetail } from "./inventory-income-detail.model";

export interface IInventoryIncome extends IEntity<Number>{
  date: Date,
  details: Array<IInventoryIncomeDetail>,
  totalCost: number
}
