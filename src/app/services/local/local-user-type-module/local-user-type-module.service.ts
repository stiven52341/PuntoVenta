import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUserTypeModule } from 'src/app/models/user-type-module.model';
import { StorageKeys } from '../../constants';
import { IEmployee } from 'src/app/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class LocalUserTypeModuleService extends InternalStorageCoreService<IUserTypeModule> {

  constructor() {
    super(StorageKeys.USER_TYPE_MODULES);
  }

  public async getPermitionsByUser(user: IEmployee){
    const data = await this.getAll();
    return data.filter(detail => detail.id.idUserType == user.idUserType);
  }

  public override insert(obj: IUserTypeModule): Promise<void> {
    throw new Error('Not allowed');
  }

  public override update(obj: IUserTypeModule): Promise<void> {
    throw new Error('Not allowed');
  }

  public override delete(obj: IUserTypeModule): Promise<void> {
    throw new Error('Not allowed');
  }
}
