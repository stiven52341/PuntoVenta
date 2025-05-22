import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IProductPurchase } from 'src/app/models/product-purchase.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductPurchaseService extends ApiCoreService<IProductPurchase>{

  constructor() {
    super(ApiKeys.PRODUCT_PURCHASE);
  }
}
