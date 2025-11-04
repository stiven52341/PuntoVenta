import { IPerson } from "./person.model";

export interface IClient extends IPerson{
    maxCredit: number;
    balance: number;
    idEmployee: number;
}