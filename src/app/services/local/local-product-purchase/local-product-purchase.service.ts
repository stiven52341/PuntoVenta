import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IProductPurchase } from 'src/app/models/product-purchase.model';
import { StorageKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalProductPurchaseService extends InternalStorageCoreService<IProductPurchase>{

  constructor() {
    super(StorageKeys.PRODUCT_PURCHASE);
  }
}
