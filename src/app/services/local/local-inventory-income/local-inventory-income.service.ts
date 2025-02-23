import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryIncomeService extends InternalStorageCoreService<IInventoryIncome> {

  constructor() {
    super(StorageKeys.INVENTORY_INCOMES);
  }
}
