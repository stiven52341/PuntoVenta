import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventory } from 'src/app/models/inventory.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryService extends InternalStorageCoreService<IInventory> {

  constructor() {
    super(StorageKeys.INVENTORY);
  }
}
