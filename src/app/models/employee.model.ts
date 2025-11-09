import { IPerson } from "./person.model";

export interface IEmployee extends IPerson{
    idUserType: number;
    username: string;
    password: string;
    remember?: boolean
}