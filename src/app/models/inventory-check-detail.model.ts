import { IEntity } from '../services/api/api-core/api-core.service';

export interface IInventoryCheckDetail
  extends IEntity<{
    idInventoryCheck: number;
    idProduct: number;
    idUnit: number;
  }> {
  amount: number;
}
