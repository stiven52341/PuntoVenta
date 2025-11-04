import { IEntity } from "../services/api/api-core/api-core.service";
import { ICoinCashbox } from "./coin-cashbox.model";

export interface ICashBox extends IEntity<Number>{
  initCash: number,
  endCash?: number,
  init: Date,
  end?: Date,
  coins: Array<ICoinCashbox>,
  idOpenEmployee: number,
  idCloseEmployee: number
}
