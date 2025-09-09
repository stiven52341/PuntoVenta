import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { ICashBox } from 'src/app/models/cash-box.model';
import { ApiKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class CashBoxService extends ApiCoreService<ICashBox>{

  constructor() {
    super(ApiKeys.CASH_BOX);
  }
}
