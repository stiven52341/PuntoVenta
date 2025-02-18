export interface IPurchaseDetail{
  id: {
    id_purchase: number,
    id_unit: number,
    id_product: number,
    id_currency: number
  },
  amount: number,
  state: boolean
}
