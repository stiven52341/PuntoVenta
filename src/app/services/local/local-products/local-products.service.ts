import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IProduct } from 'src/app/models/product.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalProductsService extends InternalStorageCoreService<IProduct> {

  constructor() {
    super(StorageKeys.PRODUCTS);
  }
}
