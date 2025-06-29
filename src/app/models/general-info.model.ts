import { IEntity } from "../services/api/api-core/api-core.service";

export interface IGeneralInfo extends IEntity<Number>{
  isFirstTime: boolean;
  settedSuccesfully?: boolean;
  imprimirConLogo?: boolean;
}
