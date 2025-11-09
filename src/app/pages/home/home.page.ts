import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonContent, IonFooter, IonHeader, IonLabel, IonMenu, IonRouterOutlet, IonTitle, IonToolbar, MenuController } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/elements/button-list/button-list.component';
import { IButton } from 'src/app/models/button.model';
import { OrdersService } from 'src/app/services/api/orders/orders.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, ButtonListComponent, IonFooter, IonLabel, IonRouterOutlet]
})
export class HomePage implements OnInit {
  protected menuOptions: Array<IButton>;
  protected version?: string;

  constructor(
    private readonly _router: Router,
    private readonly _menuCtrl: MenuController,
    private readonly _toast: ToastService,
    private readonly _order: OrdersService,
    private readonly _internet: NetworkService
  ) {
    this.menuOptions = [
      {
        title: "Caja",
        image: "../assets/icon/cash.png",
        do: async () => {
          await this.goTo("/home/cash-box");
        },
      },
      {
        title: "Productos",
        image: "../assets/icon/apple.png",
        do: async () => {
          await this.goTo("/home/products");
        },
      },
      {
        title: "Pedidos",
        image: '../assets/icon/order.png',
        do: async () => {
          await this.goTo("/home/orders");
        }
      },
      {
        title: "Carrito",
        image: "../assets/icon/cart.png",
        do: async () => {
          await this.goTo("/home/cart");
        },
      },
      {
        title: 'Cuentas x cobrar',
        image: '../assets/icon/money.png',
        do: async () => {
          await this.goTo('/home/cxc');
        }
      },
      {
        title: "Inventario",
        image: "../assets/icon/inventory.png",
        do: async () => {
          await this.goTo("/home/inventory");
        },
      },
      {
        title: "Mantenimientos",
        image: "../assets/icon/pencil.png",
        do: async () => {
          await this.goTo("/home/mants");
        },
      },
      {
        title: "Consultas",
        image: "../assets/icon/search.png",
        do: async () => {
          await this.goTo("/home/consults");
        },
      },
      {
        title: "Configuración",
        image: "../assets/icon/setting.png",
        do: async () => {
          await this.goTo("/home/config");
        },
      },
      {
        title: 'Cerrar sesión',
        image: '../assets/icon/exit.png',
        do: async () => {
          await this._router.navigate(['/login'], {queryParams: {loggedOut: true}});
        }
      }
    ];
  }

  ngOnInit() {
    App.getInfo().then((info) => {
      this.version = info.version;
    });

    this.checkOrders();
    setInterval(() => {
      this.checkOrders();
    }, 5 * 1000 * 60);
  }

  private checkOrders(){
    this._internet.isInternetAvailable().then((result) => {
      if(!result) return;
      this._order.getNotProcessed().then(orders => {
        if(orders.length == 0) return;
        this._toast.showToast('Tiene pedidos pendientes por procesar',5000);
        const button = this.menuOptions.find(button => button.title == 'Pedidos');
        button!.info = orders.length.toString();
      });
    });
  }

  private async goTo(path: string) {
    await this._router.navigate([path]);
    this._menuCtrl.close();
  }
}
