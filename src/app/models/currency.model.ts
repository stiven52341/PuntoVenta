import { IEntity } from "../services/api/api-core/api-core.service";

export interface ICurrency extends IEntity<Number>{
  name: string,
  shortcut: string,
  isDefault: boolean,
}
