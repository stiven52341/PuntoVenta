import { IEntity } from "../services/api/api-core/api-core.service";

export interface IOrderDetail extends IEntity<{
    idOrder: number,
    idUnitProduct: number
}>{
    amount: number,
    priceUsed: number
}