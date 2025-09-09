import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { ApiKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryIncomeService extends ApiCoreService<IInventoryIncome>{

  constructor() {
    super(ApiKeys.INVENTORY_INCOMES);
  }
}
