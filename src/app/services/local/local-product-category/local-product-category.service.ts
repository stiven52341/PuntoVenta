import { inject, Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IProductCategory } from 'src/app/models/product-category.model';
import { StorageKeys } from 'src/app/services/constants';
import { ICategory } from 'src/app/models/category.model';
import { LocalCategoriesService } from '../local-categories/local-categories.service';
import { firstValueFrom, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalProductCategoryService extends InternalStorageCoreService<IProductCategory> {
  private readonly _category = inject(LocalCategoriesService);

  constructor() {
    super(StorageKeys.PRODUCT_CATEGORIES);
  }

  public async getCategoriesByProduct(idProduct: number): Promise<Array<ICategory>> {
    const data = await this.getAll();
    const relations = data.filter(pc => +pc.id.idProduct == +idProduct);

    const categories: Array<ICategory> = [];

    const addCategory = async (relation: IProductCategory) => {
      const category = await this._category.get(relation.id.idCategory);
      if (!category) throw new Error('Category not found');
      categories.push(category);
    }

    const pros: Array<Promise<void>> = [];
    try {
      for (const relation of relations) {
        pros.push(addCategory(relation));
      }
      await firstValueFrom(forkJoin(pros));
    } catch (error) {
      throw error;
    } finally {
      return categories;
    }
  }
}
