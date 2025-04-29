import { States } from "./constants";

export interface ICategory{
  id: number,
  name: string,
  descr?: string,
  state: boolean,
  uploaded: States
}
