import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUnit } from 'src/app/models/unit.model';
import { StorageKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class LocalUnitsService extends InternalStorageCoreService<IUnit>{
  constructor() {
    super(StorageKeys.UNITS);
  }
}
