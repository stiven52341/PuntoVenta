import { States } from "./constants"

export interface IImageProduct{
  id: number,
  data: string
  uploaded: States,
  state: boolean
}
