import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IOrder } from 'src/app/models/order.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';
import { OrdersService } from 'src/app/services/api/orders/orders.service';
import { FilesService } from 'src/app/services/files/files.service';
import { LocalOrdersService } from 'src/app/services/local/local-orders/local-orders.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { OrdersWsService } from 'src/app/services/web-socket/orders/orders-ws.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
    IonLabel, IonList, IonItem, DatePipe, IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class OrdersPage implements OnInit {
  protected orders: Array<IOrder> = [];
  protected loading: boolean = false;
  private page: number = 0;

  constructor(
    private _orders: OrdersService,
    private _orderWs: OrdersWsService,
    private _network: NetworkService,
    private _alert: AlertsService,
    private _toast: ToastService,
    private _file: FilesService,
    private _error: ErrorsService
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    if (
      !await this._network.isInternetAvailable()
    ) {
      this._alert.showError('Se requiere internet para ver los pedidos');
      return;
    }
    await this.generateItems();

    this._orderWs.connect().subscribe({
      next: async (order) => {
        this._toast.showToast('Nuevo pedido');
        this.loading = true;
        this.page = 0;
        this.orders = [];
        await this.generateItems();
      },
      error: (err) => {
        this._alert.showError('Error consultando nuevos pedidos');
        this._file.saveError(err);
        this._error.saveErrors(err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private async generateItems(limit: number = 10) {

    try {
      this.loading = true;
      this.orders.push(...(await this._orders.getPaged(this.page, limit) || []));
      this.page++;
    } catch (error) {
      this._alert.showError('Error consultando pedidos');
    } finally {
      this.loading = false;
    }

  }

  protected async onIonInfinite($event: InfiniteScrollCustomEvent) {
    await this.generateItems();
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }
}
