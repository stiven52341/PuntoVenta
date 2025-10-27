import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { LocalBillInvoiceService } from 'src/app/services/local/local-bill-invoice/local-bill-invoice.service';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { IClient } from 'src/app/models/client.model';
import { LocalClientService } from 'src/app/services/local/local-client/local-client.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { IPurchase } from 'src/app/models/purchase.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-bill-invoices-list',
  templateUrl: './bill-invoices-list.component.html',
  styleUrls: ['./bill-invoices-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonContent,
    HeaderBarComponent,
    IonList,
    IonItem,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonLabel,
    IonImg,
    DecimalPipe,
    DatePipe,
    IonToolbar,
    IonSearchbar
  ]
})
export class BillInvoicesListComponent implements OnInit {
  protected loading: boolean = false;
  private billInvoices: Array<InvoiceData> = [];
  protected billInvoicesFiltered: Array<InvoiceData> = [];

  constructor(
    private _billInvoices: LocalBillInvoiceService,
    private _client: LocalClientService,
    private _purchase: LocalPurchaseService,
    private _modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    const invoices = (await this._billInvoices.getAll()).sort((a,b) => b.id - a.id);
    for(const invoice of invoices){
      this.billInvoices.push(await this.getValues(invoice));
    }

    this.generateItems(this.billInvoices);
  }

  private generateItems(list: Array<InvoiceData>, limit: number = 15) {
    const count = this.billInvoicesFiltered.length;

    for (let i = 0; i < limit; i++) {
      const invoice = list[count + i];
      if (!invoice) continue;
      this.billInvoicesFiltered.push(invoice);
    }
  }

  protected async onSearch($event: CustomEvent){
    
    const text = ($event.detail.value as string).trim().toLowerCase();
    
    const newList = this.billInvoices.filter(invoice => {
      return (
        invoice.client.name.trim().toLowerCase().includes(text) ||
        invoice.purchase.id.toString().includes(text) ||
        invoice.invoice.id.toString().includes(text)
      );
    }).sort((a,b) => b.invoice.id - a.invoice.id);
    this.billInvoicesFiltered = [];
    this.generateItems(newList);
  }

  async onIonInfinite($event: InfiniteScrollCustomEvent) {
    this.generateItems(this.billInvoices);
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }

  private async getValues(invoice: IBillInvoice): Promise<InvoiceData>{
      const purchase = await this._purchase.get(invoice.idBill);
      const client = await this._client.get(purchase!.idClient as number);

      const data: InvoiceData = {
        invoice: invoice,
        client: client!,
        purchase: purchase!
      };
      return data;
  }

  protected onClick(invoice: IBillInvoice){
    this._modalCtrl.dismiss(invoice);
  }
}

interface InvoiceData{
  invoice: IBillInvoice, purchase: IPurchase, client: IClient
}