import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IGeneralInfo } from 'src/app/models/general-info.model';
import { StorageKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class GeneralInfoService extends InternalStorageCoreService<IGeneralInfo>{

  constructor() {
    super(StorageKeys.GENERAL_INFO);
  }

  public async getGeneralInfo(){
    return await this.get(1);
  }

  public async setNotSuccessful(){
    const info = await this.getGeneralInfo();
    info!.settedSuccesfully = false;
    await this.set([info!]);
  }

  public async setSuccesful(){
    const info = await this.getGeneralInfo();
    info!.settedSuccesfully = true;
    await this.set([info!]);
  }
}
