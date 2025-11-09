import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IModule } from 'src/app/models/module.model';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class ModuleService extends ApiCoreService<IModule>{

  constructor() {
    super(ApiKeys.MODULES);
  }

  public override async getByParam(param: string, value: string | number | Object): Promise<IModule[] | undefined> {
    throw new Error("Not allowed");
  }

  public override async insert(obj: IModule): Promise<string>{
    throw new Error("Not allowed");
  }

  public override async update(obj: IModule): Promise<boolean>{
    throw new Error("Not allowed");
  }

  public override async delete(obj: IModule): Promise<boolean>{
    throw new Error("Not allowed");
  }
}
