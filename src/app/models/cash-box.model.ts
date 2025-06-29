import { IEntity } from "../services/api/api-core/api-core.service";

export interface ICashBox extends IEntity<Number>{
  initCash: number,
  endCash?: number,
  init: Date,
  end?: Date
}
