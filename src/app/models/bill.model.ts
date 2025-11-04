import { IEntity } from "../services/api/api-core/api-core.service";

export interface IBill extends IEntity<number>{
    total: number,
    balance: number,
}