import { IEntity } from "../services/api/api-core/api-core.service";

export interface IProductPurchase extends IEntity{
    idProduct: number;
    amount: number;
    cost: number;
    idCurrency: number;
    idUnit: number;
}