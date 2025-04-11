import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalPurchaseDetailService extends InternalStorageCoreService<IPurchaseDetail>{

  constructor() {
    super(StorageKeys.PURCHASES_DETAILS);
  }
}
