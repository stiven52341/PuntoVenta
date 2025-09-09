import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IProductCategory } from 'src/app/models/product-category.model';
import { StorageKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalProductCategoryService extends InternalStorageCoreService<IProductCategory>{

  constructor() {
    super(StorageKeys.PRODUCT_CATEGORIES);
  }
}
