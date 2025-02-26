import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { ApiKeys } from 'src/app/models/constants';
import { IUnitProduct } from 'src/app/models/unit-product.model';

@Injectable({
  providedIn: 'root'
})
export class UnitProductService extends ApiCoreService<IUnitProduct>{

  constructor() {
    super(ApiKeys.UNIT_PRODUCTS);
  }

  public async getByProduct(idProduct: number){
    return await this.getByParam('product', idProduct);
  }
}
