import { IEntity } from "../services/api/api-core/api-core.service";

export interface ICoin extends IEntity<number>{
    value: number
}