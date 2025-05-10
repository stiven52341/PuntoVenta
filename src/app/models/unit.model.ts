import { States } from "./constants";

export interface IUnit{
  id: number,
  name: string,
  shortcut?: string,
  state: boolean,
  uploaded: States,
  allowDecimals: boolean
}
