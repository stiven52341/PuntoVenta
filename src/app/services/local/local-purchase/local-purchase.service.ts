import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IPurchase } from 'src/app/models/purchase.model';
import { StorageKeys } from 'src/app/models/constants';
import { LocalPurchaseDetailService } from '../local-purchase-detail/local-purchase-detail.service';
import { firstValueFrom, forkJoin, lastValueFrom } from 'rxjs';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';

@Injectable({
  providedIn: 'root'
})
export class LocalPurchaseService extends InternalStorageCoreService<IPurchase>{

  constructor(private _details: LocalPurchaseDetailService) {
    super(StorageKeys.PURCHASES);
  }

  public override async insert(obj: IPurchase){
    if(!obj.details || obj.details.length == 0)return;

    const values = await this.getAll();
    obj.id = await this.getNextID();
    const details = new Array<IPurchaseDetail>(...obj.details) || [];
    obj.details = undefined;
    values.push(obj);
    await this._storage.set(this.key, values);

    const insertDetails = async (detail: IPurchaseDetail) => {
      detail.id.idPurchase = obj.id;
      await this._details.insert(detail);
    }

    for(const detail of details){
      await insertDetails(detail);
    }
  }
}
