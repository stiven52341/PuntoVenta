import { States } from "./constants";

export interface ICurrency{
  id: number,
  name: string,
  shortcut: string,
  state: boolean,
  isDefault: boolean,
  uploaded: States
}
