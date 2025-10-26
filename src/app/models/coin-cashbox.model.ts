import { IEntity } from "../services/api/api-core/api-core.service";

export interface ICoinCashbox extends IEntity<number>{
    idCoin: number;
    idCashbox: number;
    amount: number;
    closing: boolean;
}