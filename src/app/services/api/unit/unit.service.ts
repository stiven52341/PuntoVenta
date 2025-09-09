import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IUnit } from 'src/app/models/unit.model';
import { ApiKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class UnitService extends ApiCoreService<IUnit>{

  constructor() {
    super(ApiKeys.UNITS);
  }
}
