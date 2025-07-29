import { IEntity } from '../services/api/api-core/api-core.service';

export interface IUnitBaseProduct
  extends IEntity<{ idUnitBase: number; idProduct: number }> {
  equivalency: number;
}
