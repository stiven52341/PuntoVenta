import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IEmployee } from 'src/app/models/employee.model';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends ApiCoreService<IEmployee>{

  constructor() {
    super(ApiKeys.EMPLOYEES);
  }
}
