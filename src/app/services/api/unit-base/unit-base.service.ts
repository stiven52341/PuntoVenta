import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IUnitBase } from 'src/app/models/unit-base-product.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class UnitBaseService extends ApiCoreService<IUnitBase>{

  constructor() {
    super(ApiKeys.UNIT_BASE);
  }
}
