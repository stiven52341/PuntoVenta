import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IUserTypeModule } from 'src/app/models/user-type-module.model';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class UserTypeModuleService extends ApiCoreService<IUserTypeModule>{

  constructor() {
    super(ApiKeys.USER_TYPE_MODULES);
  }

  public override async insert(object: IUserTypeModule): Promise<{ idUserType: number; idModule: string; } | undefined> {
    throw new Error('Not allowed');
  }

  public override async update(object: IUserTypeModule): Promise<boolean> {
    throw new Error('Not allowed');
  }

  public override delete(object: IUserTypeModule): Promise<boolean> {
    throw new Error('Not allowed');
  }
}
