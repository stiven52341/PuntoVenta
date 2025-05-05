import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { ICashBox } from 'src/app/models/cash-box.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalCashBoxService extends InternalStorageCoreService<ICashBox>{

  constructor() {
    super(StorageKeys.CASH_BOXES);
  }
}
