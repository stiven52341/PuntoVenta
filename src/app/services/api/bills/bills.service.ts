import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IBill } from 'src/app/models/bill.model';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class BillsService extends ApiCoreService<IBill>{

  constructor() {
    super(ApiKeys.BILLS);
  }
}
