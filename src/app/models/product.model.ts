import { States } from "./constants";

export interface IProduct{
  id: number,
  name: string,
  category?: string,
  description?: string,
  state: boolean,
  uploaded: States
}
