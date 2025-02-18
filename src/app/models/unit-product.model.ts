export interface IUnitProduct{
  id: {
    id_unit: number,
    id_product: number,
    id_currency: number
  },
  isDefault: boolean,
  amount: number,
  cost: number,
  unit?: string,
  currency?: string,
  state: boolean
}
