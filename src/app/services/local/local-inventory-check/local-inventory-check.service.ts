import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryCheckService extends InternalStorageCoreService<IInventoryCheck>{

  constructor() {
    super(StorageKeys.INVENTORY_CHECKS);
  }
}
