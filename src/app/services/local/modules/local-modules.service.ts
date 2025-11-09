import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IModule } from 'src/app/models/module.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class LocalModulesService extends InternalStorageCoreService<IModule>{

  constructor() {
    super(StorageKeys.MODULES);
  }
}
