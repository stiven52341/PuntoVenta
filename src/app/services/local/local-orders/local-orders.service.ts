import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IOrder } from 'src/app/models/order.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class LocalOrdersService extends InternalStorageCoreService<IOrder>{

  constructor() {
    super(StorageKeys.ORDERS);
  }
}
