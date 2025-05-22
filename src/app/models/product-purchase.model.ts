import { Entity } from "../services/api/api-core/api-core.service";

export interface IProductPurchase extends Entity{
    idProduct: number;
    amount: number;
    cost: number;
    idCurrency: number;
    idUnit: number;
}