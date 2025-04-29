import { States } from "./constants";

export interface IGeneralInfo{
  id: number;
  isFirstTime: boolean;
  settedSuccesfully?: boolean;
  state: boolean,
  uploaded: States
}
