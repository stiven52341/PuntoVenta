import { IEntity } from "../services/api/api-core/api-core.service";

export interface IPerson extends IEntity<number>{
    name: string;
    phone: string;
    address?: string;
}