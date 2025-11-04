import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IEmployee } from 'src/app/models/employee.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class CurrentEmployeeService extends InternalStorageCoreService<IEmployee>{

  constructor() {
    super(StorageKeys.CURRENT_EMPLOYEE);
  }

  public async getCurrentEmployee(): Promise<IEmployee | undefined>{
    return (await this.getAll())[0] || undefined;
  }

  public async setCurrentEmployee(employee: IEmployee){
    this.set([employee]);
  }

  public override async  insert(obj: IEmployee): Promise<void>{
    throw new Error('Not allowed');
  }

  public override async  update(obj: IEmployee): Promise<void>{
    throw new Error('Not allowed');
  }

  public override async  delete(obj: IEmployee): Promise<void>{
    throw new Error('Not allowed');
  }

  public override async  deactivate(obj: IEmployee): Promise<void>{
    throw new Error('Not allowed');
  }

  public override async getNextID(): Promise<number>{
    throw new Error('Not allowed');
  }
}
