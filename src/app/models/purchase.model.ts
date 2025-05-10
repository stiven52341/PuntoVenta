import { States } from "./constants";
import { IPurchaseDetail } from "./purchase-detail.model";

export interface IPurchase{
  id: number,
  date: Date,
  total: number,
  state: boolean,
  details?: Array<IPurchaseDetail>,
  uploaded: States,
}
