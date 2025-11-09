import { IEntity } from "../services/api/api-core/api-core.service";

export interface IUserType extends IEntity<number>{
    description: string
}