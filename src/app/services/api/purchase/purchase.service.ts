import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IPurchase } from 'src/app/models/purchase.model';
import { ApiKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService extends ApiCoreService<IPurchase>{

  constructor() {
    super(ApiKeys.PURCHASE);
  }
}
