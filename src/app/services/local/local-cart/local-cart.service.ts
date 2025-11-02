import { inject, Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { ICart } from 'src/app/models/cart.model';
import { States, StorageKeys } from 'src/app/services/constants';
import { IProduct } from 'src/app/models/product.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { LocalUnitsService } from '../local-units/local-units.service';

@Injectable({
  providedIn: 'root',
})
export class LocalCartService extends InternalStorageCoreService<ICart> {
  private cartEvent = new BehaviorSubject<ICart>({
    id: 1,
    products: [],
    state: true,
    uploaded: States.NOT_SYNCABLE
  });
  private _unit = inject(LocalUnitsService);

  constructor() {
    super(StorageKeys.CART);
    this.setCart();
  }

  public async setCart() {
    let cart = await this.get(1);
    if (!cart) {
      cart = {
        id: 1,
        products: [],
        state: true,
        uploaded: States.NOT_SYNCABLE
      };
      await this.insert(cart);
      this.cartEvent.next(cart);
      return cart;
    } else {
      this.cartEvent.next(cart);
      return cart;
    }
  }

  public async addProduct(product: IProduct, amount: number, price: IUnitProduct) {
    if (!amount || amount <= 0) return;

    const cart = await this.setCart();

    if(cart.products.findIndex(pro => pro.product.id == product.id) != -1){
      await this.updateProduct(product, amount, price);
      return;
    }

    const unit = await this._unit.get(price.idUnit);
    cart.products.push({ product: product, amount: amount, price: price, unit: unit! });
    this.cartEvent.next(cart);
    await this.update(cart);
  }

  public async updateProduct(product: IProduct, amount: number, price: IUnitProduct){
    if (!amount || amount <= 0) return;
    const cart = await this.setCart();
    const index = cart.products.findIndex(pro => pro.product.id == product.id);
    if(index == -1) return;

    const unit = await this._unit.get(price.idUnit);
    cart.products[index] = {
      product: product,
      amount: amount,
      price: price,
      unit: unit!
    };
    this.cartEvent.next(cart);
    await this.update(cart);
  }

  public async removeProduct(product: IProduct){

    const cart = await this.setCart();
    const index = cart.products.findIndex(pro => +pro.product.id == +product.id);
    if(index == -1) return;

    cart.products.splice(index,1);
    await this.update(cart);
    this.cartEvent.next(cart);

  }

  public async resetCart(){
    const cart = await this.setCart();
    cart.products = [];
    await this.update(cart);
    this.cartEvent.next(cart);
  }

  public async getTotal(cart?: ICart): Promise<number>{
    const cart_ = cart ? cart : await this.setCart();
    let total = 0;
    cart_.products.map(product => total += (product.amount * product.price.price));
    return total;
  }

  public getCart(): Observable<ICart>{
    return this.cartEvent.asObservable();
  }
}
