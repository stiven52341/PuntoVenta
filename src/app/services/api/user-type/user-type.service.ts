import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IUserType } from 'src/app/models/user-type.modal';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class UserTypeService extends ApiCoreService<IUserType>{

  constructor() {
    super(ApiKeys.USER_TYPE);
  }

  public override insert(object: IUserType): Promise<number | undefined> {
    throw new Error("Not allowed");
  }

  public override update(object: IUserType): Promise<boolean> {
    throw new Error("Not allowed")
  }

  public override delete(object: IUserType): Promise<boolean> {
    throw new Error("Not allowed")
  }
}
