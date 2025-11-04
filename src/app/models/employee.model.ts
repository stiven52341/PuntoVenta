import { IPerson } from "./person.model";

export interface IEmployee extends IPerson{
    idUserType: number;
}