import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IImageCategory } from 'src/app/models/image-category.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class ImageCategoryService extends ApiCoreService<IImageCategory>{

  constructor() {
    super(ApiKeys.IMAGE_CATEGORIES);
  }
}
