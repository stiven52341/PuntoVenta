import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { StorageKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class LocalBillInvoiceService extends InternalStorageCoreService<IBillInvoice>{

  constructor() {
    super(StorageKeys.BILL_INVOICE);
  }
}
