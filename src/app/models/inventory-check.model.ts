import { States } from "./constants";

export interface IInventoryCheck{
  id: number,
  date: Date,
  state: boolean,
  uploaded: States
}
