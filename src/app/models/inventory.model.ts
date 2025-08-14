import { IEntity } from "../services/api/api-core/api-core.service";

export interface IInventory extends IEntity<number>{
    existence: number,
    idUnit: number
}