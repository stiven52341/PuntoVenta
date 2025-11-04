import { IEntity } from "../services/api/api-core/api-core.service";
import { IPurchaseDetail } from "./purchase-detail.model";

export interface IPurchase extends IEntity<Number>{
  date: Date,
  total: number,
  details?: Array<IPurchaseDetail>,
  idClient?: number,
  isCredit: boolean,
  isPaid: boolean,
  idEmployee: number
}
