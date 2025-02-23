import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryIncomeDetailService extends InternalStorageCoreService<IInventoryIncomeDetail>{

  constructor() {
    super(StorageKeys.INVENTORY_INCOME_DETAILS);
  }

  public async getByIncome(id: number){
    return (await this.getAll()).filter(detail => {
      return detail.id.id_inventory_income == id;
    });
  }
}
