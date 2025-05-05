import { States } from "./constants";

export interface ICategory{
  id: number,
  name: string,
  description?: string,
  state: boolean,
  uploaded: States
}
