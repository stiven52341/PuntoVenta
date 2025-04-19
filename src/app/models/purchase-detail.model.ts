export interface IPurchaseDetail{
  id: {
    idPurchase: number,
    idUnitProductCurrency: number
  },
  amount: number,
  state: boolean,
  priceUsed: number,
  uploaded?: boolean
}
