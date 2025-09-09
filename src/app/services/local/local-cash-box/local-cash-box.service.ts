import { EventEmitter, Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { ICashBox } from 'src/app/models/cash-box.model';
import { StorageKeys } from 'src/app/services/constants';
import { LocalPurchaseService } from '../local-purchase/local-purchase.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalCashBoxService extends InternalStorageCoreService<ICashBox> {
  constructor(private _purchases: LocalPurchaseService) {
    super(StorageKeys.CASH_BOXES);
  }

  public async calculateBalance() {
    const cashbox = await this.getOpenedCashbox();
    if (!cashbox) throw new Error('Not opened cashbox');

    let totalPurchases = 0;
    const purchases = (await this._purchases.getAll()).filter((purchase) => {
      return (
        new Date(purchase.date).getTime() >= new Date(cashbox.init).getTime() &&
        (cashbox.end
          ? new Date(purchase.date).getTime() < new Date(cashbox.end).getTime()
          : true)
      );
    });

    purchases.map((purchase) => {
      totalPurchases += purchase.total;
    });
    return cashbox.initCash + totalPurchases;
  }

  public async getOpenedCashbox(): Promise<ICashBox | undefined> {
    return ((await this.getAll()) || []).find((cashbox) => cashbox.state);
  }

  public async getPurchasesOnCurrentCashbox() {
    const cashbox = await this.getOpenedCashbox();
    if (!cashbox) return [];
    return await this._purchases.getPurchasesByDates(cashbox!.init, new Date());
  }
}
