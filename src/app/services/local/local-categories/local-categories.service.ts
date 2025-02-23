import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { ICategory } from 'src/app/models/category.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalCategoriesService extends InternalStorageCoreService<ICategory>{

  constructor() {
    super(StorageKeys.CATEGORIES);
  }
}
