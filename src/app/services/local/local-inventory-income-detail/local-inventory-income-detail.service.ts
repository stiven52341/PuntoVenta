import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { StorageKeys } from 'src/app/models/constants';
import { firstValueFrom, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalInventoryIncomeDetailService extends InternalStorageCoreService<IInventoryIncomeDetail> {
  constructor() {
    super(StorageKeys.INVENTORY_INCOME_DETAILS);
  }

  public async getByIncome(id: number) {
    return (await this.getAll()).filter((detail) => {
      return detail.id.idInventoryIncome == id;
    });
  }

  public async insertDetails(details: Array<IInventoryIncomeDetail>) {
    try {
      const promises = details.map((detail) => {
        return this.insert(detail);
      });

      await firstValueFrom(forkJoin([...promises]));
    } catch (error) {
      this._file.saveError(error);
      throw error;
    }
  }
}
