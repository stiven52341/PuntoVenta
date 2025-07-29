import { IEntity } from "../services/api/api-core/api-core.service"

export interface IInventoryIncomeDetail extends IEntity<{
    idInventoryIncome: number,
    idProduct: number,
    idUnit: number
  }>{
  amount: number,
  cost: number,
  amountBaseUnit: number
}
