import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonLabel,
  IonItem,
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButton,
  IonIcon,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    NgIf,
    IonButton,
    IonIcon,
    NgFor,
    IonLabel,
    IonItem,
    IonList,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
})
export class AppComponent {
  protected menuOptions: Array<{
    title: string;
    icon?: string;
    image?: string;
    do: () => Promise<void> | void;
  }>;

  constructor(private _router: Router, private _menuCtrl: MenuController) {
    this.setBar();

    this.menuOptions = [
      {
        title: 'Productos',
        image: '../assets/icon/apple.png',
        do: async () => {
          await this.goTo('/products');
        },
      },
      {
        title: 'Inventario',
        image: '../assets/icon/inventory.png',
        do: async () => {
          await this.goTo('/inventory');
        },
      },
      {
        title: 'Mantenimientos',
        image: '../assets/icon/pencil.png',
        do: async () => {
          await this.goTo('/mants');
        },
      },
    ];

    addIcons({});
  }

  private async setBar() {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
  }

  private async goTo(path: string) {
    await this._router.navigate([path]);
    this._menuCtrl.close();
  }
}
