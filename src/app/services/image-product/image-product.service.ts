import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IImageProduct } from 'src/app/models/image-product.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class ImageProductService extends ApiCoreService<IImageProduct>{

  constructor() {
    super(ApiKeys.IMAGE_PRODUCTS);
  }
}
