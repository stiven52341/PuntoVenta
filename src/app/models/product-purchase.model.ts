import { IEntity } from "../services/api/api-core/api-core.service";

export interface IProductPurchase extends IEntity<Number>{
    amount: number;
    cost: number;
    idCurrency: number;
    idUnit: number;
}