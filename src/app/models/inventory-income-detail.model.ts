export interface IInventoryIncomeDetail{
  id: {
    id_inventory_income: number,
    id_product: number,
    id_unit: number
  },
  amount: number,
  state: boolean
}
