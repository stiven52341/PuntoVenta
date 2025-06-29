import { IEntity } from "../services/api/api-core/api-core.service"

export interface IInventoryIncomeDetail extends IEntity<{
    id_inventory_income: number,
    id_product: number,
    id_unit: number
  }>{
  amount: number
}
