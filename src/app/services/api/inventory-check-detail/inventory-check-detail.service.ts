import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryCheckDetailService extends ApiCoreService<IInventoryCheckDetail>{

  constructor() {
    super(ApiKeys.INVENTORY_CHECK_DETAILS);
  }

  public async getByCheck(idCheck: number){
    return await this.getByParam('check', idCheck);
  }
}
