import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { ICurrency } from 'src/app/models/currency.model';
import { StorageKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalCurrenciesService extends InternalStorageCoreService<ICurrency>{

  constructor() {
    super(StorageKeys.CURRENCIES);
  }
}
