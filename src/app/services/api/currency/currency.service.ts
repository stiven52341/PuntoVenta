import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { ICurrency } from 'src/app/models/currency.model';
import { ApiKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService extends ApiCoreService<ICurrency>{

  constructor() {
    super(ApiKeys.CURRENCIES);
  }
}
