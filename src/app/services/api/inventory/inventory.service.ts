import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IInventory } from 'src/app/models/inventory.model';
import { ApiKeys } from 'src/app/models/constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryService extends ApiCoreService<IInventory> {
  constructor() {
    super(ApiKeys.INVENTORY);
  }

  public async getExistence(idProduct: number): Promise<IInventory | undefined>{
    const result = await firstValueFrom(this._http.get(this.path + '/getExistence', {
      params: {
        'idProduct': idProduct
      }
    })).catch(err => {
      throw err;
    });

    return result as IInventory;
  }

  public override async getAll(): Promise<Array<IInventory> | undefined> {
    throw new Error('Not implemented');
  }

  public override async get(id: number): Promise<IInventory | undefined> {
    throw new Error('Not implemented');
  }

  public override async getByParam(
    param: string,
    value: string | number | Object
  ): Promise<Array<IInventory> | undefined> {
    throw new Error("Not implemented");
  }

  public override async insert(
    object: IInventory
  ): Promise<number | undefined> {
    throw new Error("Not implemented");
  }

  public override async update(object: IInventory): Promise<boolean> {
    throw new Error("Not implemented");
  }

  public override async delete(object: IInventory): Promise<boolean> {
    throw new Error("Not implemented");
  }
}
