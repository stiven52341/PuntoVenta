import { inject, Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { States, StorageKeys } from 'src/app/services/constants';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LocalProductsService } from '../local-products/local-products.service';

@Injectable({
  providedIn: 'root',
})
export class LocalUnitProductsService extends InternalStorageCoreService<IUnitProduct> {
  private _localProduct = inject(LocalProductsService);

  constructor() {
    super(StorageKeys.UNIT_PRODUCTS);
  }

  public override async insert(obj: IUnitProduct) {

    if (obj.isDefault) {

      const prices = (await this.getAll()).filter(
        (price) => +price.idProduct == +obj.idProduct
      );

      prices.map((price) => (price.isDefault = false));

      for(const price of prices){
        await this.update(price);
      }
    }

    const oldValues = await this.getAll();
    oldValues.push(obj);
    await InternalStorageCoreService._storage.set(this.key, oldValues);
  }

  public override async update(obj: IUnitProduct) {
    if (obj.isDefault) {
      const prices = (await this.getAll()).filter(
        (price) => +price.idProduct == +obj.idProduct
      );

      prices.map((price) => (price.isDefault = false));
      const pros = prices.map((price) => this.update(price));
      await firstValueFrom(forkJoin(pros));
    }

    const data = await this.getAll();
    const index = data.findIndex(val => val.id == obj.id);
    if(index == -1) throw new Error("Not found");
    data[index] = obj;
    await InternalStorageCoreService._storage.set(this.key, data);
  }

  public async getBaseProductPrice(id: number): Promise<Array<IUnitProduct> | undefined> {
    const data = await firstValueFrom(forkJoin([
      this.getAll(),
      this._localProduct.get(id)
    ]));

    const localprices = data[0];
    const product = data[1];

    if(!product?.idBaseUnit){
      return undefined;
    }

    const prices: Array<IUnitProduct> = [];
    localprices.forEach(price => {
      if(product?.idBaseUnit && +price.idProduct == id && +price.idUnit == +product.idBaseUnit){
        prices.push(price);
      }
    });
    return prices;
  }

  public async checkProductPriceExistence(
    idProduct: number, idUnit: number, price: number
  ): Promise<boolean>{
    const data = await this.getAll();
    for(const value of data){
      if(
        +value.idProduct == +idProduct &&
        +value.idUnit == +idUnit &&
        +value.price == +price
      ){
        return true;
      }
    }
    return false;
  }

  public async fixUnitProducts(){

    const prices = (await this.getAll()).sort((a,b) => +a.id - +b.id);

    const dataGroup: Set<{idProduct: number, idUnit: number, price: number}> = new Set();

    prices.forEach(price => {
      const element = {
        idProduct: price.idProduct, idUnit: price.idProduct, price: price.price
      };
      dataGroup.add(element);
    });

    const newPrices: Array<IUnitProduct> = [];
    dataGroup.forEach((element,index) => {
      const newPrice: IUnitProduct = {
        id: Number(index),
        amount: 0,
        cost: element.price,
        idCurrency: 1,
        idProduct: element.idProduct,
        idUnit: element.idUnit,
        isDefault: false,
        price: element.price,
        state: true,
        uploaded: States.NOT_INSERTED
      };
      newPrices.push(newPrice);
    });
    await this.set(newPrices);
  }
}
