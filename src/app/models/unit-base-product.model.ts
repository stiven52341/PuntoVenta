import { IEntity } from '../services/api/api-core/api-core.service';

export interface IUnitBase
  extends IEntity<{ idUnit: number, idUnitBase: number }> {
  equivalency: number;
  idEmployee: number
}
