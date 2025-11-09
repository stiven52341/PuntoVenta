import { IEntity } from "../services/api/api-core/api-core.service";
import { IOrderDetail } from "./order-detail.model";

export interface IOrder extends IEntity<number>{
    name: string,
    address: string,
    phone: string,
    processed: boolean,
    total: number,
    date: string,
    details: Array<IOrderDetail>,
}