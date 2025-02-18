export interface IInventoryCheckDetail{
  id: {
    id_inventory_check: number,
    id_product: number,
    id_unit: number
  },
  amount: number,
  state: boolean
}
