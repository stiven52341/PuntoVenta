import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IProduct } from 'src/app/models/product.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiCoreService<IProduct>{

  constructor() {
    super(ApiKeys.PRODUCTS);
  }
}
