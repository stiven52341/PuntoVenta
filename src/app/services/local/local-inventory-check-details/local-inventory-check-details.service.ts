import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryCheckDetailsService extends InternalStorageCoreService<IInventoryCheckDetail>{

  constructor() {
    super(StorageKeys.INVENTORY_CHECK_DETAILS);
  }

  public async getByInventory(id: number){
    return (await this.getAll()).filter(detail => {
      return detail.id.idInventoryCheck == id
    });
  }
}
