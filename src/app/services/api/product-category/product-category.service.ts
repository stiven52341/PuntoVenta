import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IProductCategory } from 'src/app/models/product-category.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService extends ApiCoreService<IProductCategory>{

  constructor() {
    super(ApiKeys.PRODUCT_CATEGORIES);
  }
}
