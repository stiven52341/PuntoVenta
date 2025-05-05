import { States } from "./constants";

export interface ICashBox{
  id: number,
  initCash: number,
  endCash?: number,
  init: Date,
  end?: Date,
  state: boolean,
  uploaded: States
}
