import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { ICategory } from 'src/app/models/category.model';
import { ApiKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiCoreService<ICategory>{

  constructor() {
    super(ApiKeys.CATEGORIES);
  }
}
