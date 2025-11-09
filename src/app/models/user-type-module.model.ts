import { IEntity } from "../services/api/api-core/api-core.service";

export interface IUserTypeModule extends IEntity<{
    idUserType: number,
    idModule: string
}>{

}