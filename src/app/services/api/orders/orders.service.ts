import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IOrder } from 'src/app/models/order.model';
import { ApiKeys, States } from '../../constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService extends ApiCoreService<IOrder> {

  constructor() {
    super(ApiKeys.ORDERS);
  }

  public async getPaged(offset: number = 0, limit: number = 10) {
    const result = await firstValueFrom(
      this._http.get(`${this.path}/paged?offset=${offset}&limit=${limit}`)
    ).catch(err => {
      console.log(`Error while getting paged: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      this._errors.saveErrors(err);
      throw new Error(err);
    });

    if (!result) return undefined;

    const data = result as Array<IOrder>;
    data.map((value) => (value.uploaded = States.DOWNLOADED));
    return data;
  }
}
