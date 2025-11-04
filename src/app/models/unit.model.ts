import { IEntity } from "../services/api/api-core/api-core.service";
export interface IUnit extends IEntity<Number>{
  name: string,
  shortcut?: string,
  allowDecimals: boolean,
  idEmployee: number
}
