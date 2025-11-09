import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUserType } from 'src/app/models/user-type.modal';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class LocalUserTypeService extends InternalStorageCoreService<IUserType>{

  constructor() {
    super(StorageKeys.USER_TYPES);
  }
}
