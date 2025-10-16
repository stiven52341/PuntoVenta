import { IEntity } from "../services/api/api-core/api-core.service";

export interface IBillInvoice extends IEntity<number> {
    idBill: number,
    amount: number
}