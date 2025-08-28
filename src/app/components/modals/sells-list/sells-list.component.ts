import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonItem,
  IonSearchbar,
  ModalController,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IPurchase } from 'src/app/models/purchase.model';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-sells-list',
  templateUrl: './sells-list.component.html',
  styleUrls: ['./sells-list.component.scss'],
  standalone: true,
  imports: [
    IonSearchbar,
    IonItem,
    IonList,
    IonContent,
    DatePipe,
    DecimalPipe,
    IonHeader,
    HeaderBarComponent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class SellsListComponent implements OnInit {
  protected sells: Array<IPurchase> = [];
  protected sellsFiltered: Array<IPurchase> = [];
  protected loading: boolean = false;

  constructor(
    private _purchases: LocalPurchaseService,
    private _modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    this.sells = (await this._purchases.getAll()).sort((a, b) => +b.id - +a.id);
    this.generateItems(this.sells);
  }

  private generateItems(purchases: Array<IPurchase>, offset: number = 50) {
    const count = this.sellsFiltered.length;

    for (let i = 0; i < offset; i++) {
      if (purchases[count + i]) {
        this.sellsFiltered.push(purchases[count + i]);
      }
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems(this.sells);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected onSearch($event: CustomEvent) {
    const value = ($event.detail.value as string).trim().toLowerCase();
    const newList = this.sells.filter((sell) => {
      console.log(new Date(sell.date).toISOString().trim().toLowerCase());

      return (
        sell.id.toString().trim().includes(value) ||
        new Date(sell.date)
          .toISOString()
          .trim()
          .toLowerCase()
          .includes(value) ||
        sell.total.toString().trim().toLowerCase().includes(value)
      );
    });

    console.log(newList);

    this.sellsFiltered = [];
    this.generateItems(newList);
  }

  protected async onClick(purchase: IPurchase) {
    await this._modalCtrl.dismiss(purchase);
  }
}
