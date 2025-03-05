import { EventEmitter, Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { ICart } from 'src/app/models/cart.model';
import { StorageKeys } from 'src/app/models/constants';
import { IProduct } from 'src/app/models/product.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';

@Injectable({
  providedIn: 'root',
})
export class LocalCartService extends InternalStorageCoreService<ICart> {
  private cartEvent = new EventEmitter<ICart>();

  constructor() {
    super(StorageKeys.CART);
  }

  private async setCart() {
    let cart = await this.get(1);
    if (!cart) {
      cart = {
        id: 1,
        products: [],
      };
      await this.insert(cart);
      this.cartEvent.emit(cart);
      return cart;
    } else {
      return cart;
    }
  }

  public async addProduct(product: IProduct, amount: number, unit: IUnitProduct) {
    if (amount <= 0) return;

    const cart = await this.setCart();

    if(cart.products.findIndex(pro => pro.product.id == product.id) != -1){
      await this.updateProduct(product, amount, unit);
      return;
    }

    cart.products.push({ product: product, amount: amount, unit: unit });
    this.cartEvent.emit(cart);
    await this.update(cart);
  }

  public async updateProduct(product: IProduct, amount: number, unit: IUnitProduct){
    if (amount <= 0) return;
    const cart = await this.setCart();
    const index = cart.products.findIndex(pro => pro.product.id == product.id);
    if(index == -1) return;

    cart.products[index] = {
      product: product,
      amount: amount,
      unit: unit
    };
    this.cartEvent.emit(cart);
    await this.update(cart);
  }

  public async removeProduct(product: IProduct){
    const cart = await this.setCart();
    const index = cart.products.findIndex(pro => pro.product.id == product.id);
    cart.products = cart.products.slice(index,1);
    await this.update(cart);
    this.cartEvent.emit(cart);
  }

  public async resetCart(){
    const cart = await this.setCart();
    cart.products = [];
    await this.update(cart);
    this.cartEvent.emit(cart);
  }

  public async getTotal(cart?: ICart): Promise<number>{
    const cart_ = cart ? cart : await this.setCart();
    let total = 0;
    cart_.products.map(product => total += (product.amount * product.unit.price));
    return total;
  }

  public getCart(){
    return this.cartEvent.asObservable();
  }
}
