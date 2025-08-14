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
