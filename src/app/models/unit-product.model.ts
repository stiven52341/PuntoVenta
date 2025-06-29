import { IEntity } from "../services/api/api-core/api-core.service";

export interface IUnitProduct extends IEntity<Number>{
  idUnit: number;
  idProduct: number;
  idCurrency: number;
  isDefault: boolean;
  amount: number;
  price: number;
  cost: number;
  unit?: string;
  currency?: string;
  label?: string
}
