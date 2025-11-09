import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IEmployee } from 'src/app/models/employee.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class LocalEmployeeService extends InternalStorageCoreService<IEmployee>{

  constructor() {
    super(StorageKeys.EMPLOYEES);
  }

  public async loginEmployee(username: string, password: string): Promise<IEmployee | undefined>{
    const employees = await this.getAll();
    return employees.find(emp => emp.username == username && emp.password == password);    
  }
}
