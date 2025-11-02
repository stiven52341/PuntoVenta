import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';
import { LocalBillsService } from 'src/app/services/local/bills/bills.service';
import { ActivatedRoute } from '@angular/router';
import { IBill } from 'src/app/models/bill.model';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IClient } from 'src/app/models/client.model';
import { DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { call, print } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LocalClientService } from 'src/app/services/local/local-client/local-client.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PrintingService } from 'src/app/services/printing/printing.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';

@Component({
  selector: 'app-late-bills',
  templateUrl: './late-bills.page.html',
  styleUrls: ['./late-bills.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
    IonLabel, DecimalPipe, IonButton, IonIcon, IonList, IonItem, IonListHeader, IonImg,
    IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class LateBillsPage implements OnInit {
  protected client?: IClient;
  protected bills: Array<IBill> = [];
  protected billsFiltered: Array<IBill> = [];
  protected loading: boolean = false;

  constructor(
    private _bill: LocalBillsService, private _route: ActivatedRoute, private _client: LocalClientService,
    private _modal: ModalsService, private _print: PrintingService, private _alert: AlertsService
  ) {
    addIcons({ call, print })
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.generateItems(this.bills);
    this.loading = false;
  }

  private async init() {
    const id = this._route.snapshot.params['id'] as number;
    const data = await firstValueFrom(forkJoin([
      this._client.get(id),
      this._bill.getBillsByClient(id)
    ]));
    this.client = data[0];
    this.bills = data[1].sort((a,b) => {
      const paidA = a.total - a.balance > 0 ? a.total - a.balance : 0;
      const paidB = b.total - b.balance > 0 ? b.total - b.balance : 0;
      return (b.id - a.id) + (paidB - paidA);
    });
  }

  protected onCall() {
    window.location.href = `tel:${this.client?.phone}`;
  }

  protected onClickBill(bill: IBill) {

    this._alert.showOptions(
      'Confirme',
      `¿Qué desea hacer con la factura #<b>${bill.id.toString().padStart(5, '0')}?</b>`,
      [
        {
          label: 'Imprimir',
          do: async () => {
            this._print.printBill(bill);
          }
        },
        {
          label: 'Abonar',
          do: async () => {
            this.loading = true;
            this._modal.showBillPay(bill.id, bill).then(async (bill) => {
              if (!bill) return;
              this.loading = true;
              await this.init();
              this.loading = false;
            }).finally(() => this.loading = false);
          }
        }
      ]
    );


  }

  private generateItems(list: Array<IBill>, limit: number = 15){
    const count = this.billsFiltered.length;
    for(let i = 0; i < limit; i++){
      const item = list[count + i];
      if(!item) continue;
      this.billsFiltered.push(item);
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems(this.bills);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }
}
