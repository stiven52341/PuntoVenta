import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IClient } from 'src/app/models/client.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class LocalClientService extends InternalStorageCoreService<IClient>{

  constructor() {
    super(StorageKeys.CLIENTS);
  }
}
