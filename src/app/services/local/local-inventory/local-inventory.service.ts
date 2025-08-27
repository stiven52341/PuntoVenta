import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventory } from 'src/app/models/inventory.model';
import { States, StorageKeys } from 'src/app/models/constants';
import { LocalProductsService } from '../local-products/local-products.service';

@Injectable({
  providedIn: 'root'
})
export class LocalInventoryService extends InternalStorageCoreService<IInventory> {

  constructor(private _localProduct: LocalProductsService) {
    super(StorageKeys.INVENTORY);
  }

  private async updateInventory(idProduct: number, amount: number) {

    const existence = await this.get(idProduct);
    if (!existence) {
      const product = await this._localProduct.get(idProduct);
      if(!product?.idBaseUnit){
        throw new Error(`No base unit for product ${product!.name}`);
      }
      const newExistence: IInventory = {
        id: idProduct,
        existence: amount,
        idUnit: product.idBaseUnit,
        state: true,
        uploaded: States.NOT_INSERTED
      };
      await this.insert(newExistence);
      return;
    }
    existence.existence += amount;
    await this.update(existence);
  }

  public async reduceExistence(idProduct: number, amount: number) {
    
    if (amount <= 0) {
      throw new Error("Amount must be higher than 0");
    }
    await this.updateInventory(idProduct, -amount);
  }

  public async increaseExistence(idProduct: number, amount: number) {
    if (amount <= 0) {
      throw new Error("Amount must be higher than 0");
    }
    await this.updateInventory(idProduct, amount);
  }
}
