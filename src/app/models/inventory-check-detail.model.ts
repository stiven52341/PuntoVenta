import { IEntity } from '../services/api/api-core/api-core.service';

export interface IInventoryCheckDetail
  extends IEntity<{
    id_inventory_check: number;
    id_product: number;
    id_unit: number;
  }> {
  amount: number;
}
