import { States } from "./constants"

export interface IImageCategory {
  id: number,
  image: string,
  uploaded: States
  state: boolean
}
