import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUnitBaseProduct } from 'src/app/models/unit-base-product.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalUnitBaseService extends InternalStorageCoreService<IUnitBaseProduct>{

  constructor() {
    super(StorageKeys.UNIT_BASE);
  }
}
