export interface IUnitProduct {
  id: number;
  idUnit: number;
  idProduct: number;
  idCurrency: number;
  isDefault: boolean;
  amount: number;
  price: number;
  cost: number;
  unit?: string;
  currency?: string;
  state: boolean;
}
