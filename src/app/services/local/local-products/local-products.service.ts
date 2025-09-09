import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IProduct } from 'src/app/models/product.model';
import { StorageKeys } from 'src/app/services/constants';
import { ProductService } from '../../api/product/product.service';
import { firstValueFrom, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalProductsService extends InternalStorageCoreService<IProduct> {

  constructor(
    private _product: ProductService
  ) {
    super(StorageKeys.PRODUCTS);
  }

  public async setBaseUnitForAllProducts(idUnit: number) {
    try {
      const products = await this.getAll();

      products.map(product => {
        product.idBaseUnit = idUnit;
      });

      const localProductPros = products.map(pro => this.update(pro));
      const apiProductPros = products.map(pro => this._product.update(pro));

      await firstValueFrom(forkJoin([
        ...apiProductPros,
        ...localProductPros
      ]));
    } catch (error) {
      throw error;
    }
  }
}
