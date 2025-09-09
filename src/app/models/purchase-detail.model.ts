import { IEntity } from "../services/api/api-core/api-core.service"
import { States } from "../services/constants"

export interface IPurchaseDetail extends IEntity<{
    idPurchase: number,
    idUnitProductCurrency: number
  }>{
  amount: number,
  priceUsed: number,
}
