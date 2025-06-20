import { States } from "./constants"

export interface IImageCategory {
  id: number,
  data: string,
  uploaded: States
  state: boolean
}
