import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryIncomeCartService extends InternalStorageCoreService<IInventoryIncome>{

  constructor() {
    super(StorageKeys.INVENTORY_INCOME_CART);
  }

  public override async insert(obj: IInventoryIncome){
    if(obj.details.length == 0){
      throw new Error('Must provide details');
    }

    const old = await this.getAll();
    if(old.length == 1){
      await this.update(obj);
      return;
    }
    old.push(obj);
    await this.set(old);
  }

  public async reset(){
    await this.set([]);
  }

  public async getCurrent(){
    return (await this.getAll())[0] || undefined;
  }
}
