import { Injectable } from '@angular/core';
import { IBill } from 'src/app/models/bill.model';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { StorageKeys } from '../../constants';
import { LocalPurchaseService } from '../local-purchase/local-purchase.service';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { LocalClientService } from '../local-client/local-client.service';

@Injectable({
  providedIn: 'root'
})
export class LocalBillsService extends InternalStorageCoreService<IBill>{

  constructor(private _purchase: LocalPurchaseService, private _client: LocalClientService){
    super(StorageKeys.BILLS);
  }

  public async getBillsByClient(idClient: number){
    const purchases = (await this._purchase.getAll()).filter(
      purchase => purchase.idClient == idClient
    );
    return (await this.getAll()).filter(bill => purchases.some(purchase => purchase.id == bill.id));
  }

  public async addBillInvoice(invoice: IBillInvoice){
    const bill = await this.get(invoice.idBill);    
    if(!bill)throw new Error(`Bill #${invoice.idBill} not found`);

    const purchase = await this._purchase.get(bill.id);
    if(!purchase) throw new Error(`Purchase ${bill.id} not found`);

    const client = await this._client.get(purchase.idClient!);
    if(!client) throw new Error(`Client #${purchase.idClient} not found`);

    bill.balance += invoice.amount;
    await this.update(bill);

    client.balance -= invoice.amount;
    await this._client.update(client);

    if(bill.total == bill.balance){
      purchase.isPaid = true;
    }
    await this._purchase.update(purchase);
  }
}
