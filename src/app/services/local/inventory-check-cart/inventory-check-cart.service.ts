import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class InventoryCheckCartService extends InternalStorageCoreService<IInventoryCheck>{

  constructor() {
    super(StorageKeys.INVENTORY_CHECK_CART);
  }

  public override async insert(obj: IInventoryCheck){
    if(obj.details.length == 0){
      throw new Error("Must provide details");
    }
    const data = await this.getAll();
    if(data.length == 1){
      await this.update(obj);
      return;
    }
    data.push(obj);
    await this.set(data);
  }

  public async reset(){
    await this.set([]);
  }

  public async getCurrent(){
    return (await this.getAll())[0] || undefined;
  }
}
