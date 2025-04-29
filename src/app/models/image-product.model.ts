import { States } from "./constants"

export interface IImageProduct{
  id: number,
  image: string,
  uploaded: States,
  state: boolean
}
