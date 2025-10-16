import { Component, OnInit } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';
import { LocalBillsService } from 'src/app/services/local/bills/bills.service';
import { ActivatedRoute } from '@angular/router';
import { IBill } from 'src/app/models/bill.model';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IClient } from 'src/app/models/client.model';
import { DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { call } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LocalClientService } from 'src/app/services/local/local-client/local-client.service';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-late-bills',
  templateUrl: './late-bills.page.html',
  styleUrls: ['./late-bills.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
    IonLabel, DecimalPipe, IonButton, IonIcon, IonList, IonItem, IonListHeader, IonImg
  ]
})
export class LateBillsPage implements OnInit {
  protected client?: IClient;
  protected bills?: Array<IBill>;
  protected loading: boolean = false;

  constructor(
    private _bill: LocalBillsService, private _route: ActivatedRoute, private _client: LocalClientService,
    private _modal: ModalsService
  ) {
    addIcons({ call })
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    const id = this._route.snapshot.params['id'] as number;
    const data = await firstValueFrom(forkJoin([
      this._client.get(id),
      this._bill.getBillsByClient(id)
    ]));
    this.client = data[0];
    this.bills = data[1].filter(bill => bill.balance < bill.total);
  }

  protected onCall() {
    window.location.href = `tel:${this.client?.phone}`;
  }

  protected onClickBill(bill: IBill) {
    this.loading = true;
    this._modal.showBillPay(bill.id, bill).then(async (bill) => {
      if(!bill) return;
      this.loading = true;
      await this.init();
      this.loading = false;
    }).finally(() => this.loading = false);
  }
}
