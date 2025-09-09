import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { ApiKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryCheckService extends ApiCoreService<IInventoryCheck>{

  constructor() {
    super(ApiKeys.INVENTORY_CHECKS);
  }
}
