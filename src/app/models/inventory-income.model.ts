import { States } from "./constants";

export interface IInventoryIncome{
  id: number,
  date: Date,
  state: boolean,
  uploaded: States
}
