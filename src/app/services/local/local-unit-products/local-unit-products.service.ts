import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalUnitProductsService extends InternalStorageCoreService<IUnitProduct>{

  constructor() {
    super(StorageKeys.UNIT_PRODUCTS);
  }
}
