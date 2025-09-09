import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUnitBase } from 'src/app/models/unit-base-product.model';
import { StorageKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalUnitBaseService extends InternalStorageCoreService<IUnitBase> {

  constructor(
    
  ) {
    super(StorageKeys.UNIT_BASE);
  }
}
