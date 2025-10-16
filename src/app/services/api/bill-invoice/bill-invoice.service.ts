import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class BillInvoiceService extends ApiCoreService<IBillInvoice>{

  constructor() {
    super(ApiKeys.BILL_INVOICE)
  }
}
