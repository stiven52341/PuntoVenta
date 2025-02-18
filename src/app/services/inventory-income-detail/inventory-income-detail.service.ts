import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryIncomeDetailService extends ApiCoreService<IInventoryIncomeDetail>{

  constructor() {
    super(ApiKeys.INVENTORY_INCOME_DETAILS);
  }
}
