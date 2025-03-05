import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
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
  Platform,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { StatusBar, Style } from '@capacitor/status-bar';
import { GeneralInfoService } from './services/local/general-info/general-info.service';
import { IGeneralInfo } from './models/general-info.model';
import { ModalsService } from './services/modals/modals.service';

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
export class AppComponent implements OnInit {
  protected menuOptions: Array<{
    title: string;
    icon?: string;
    image?: string;
    do: () => Promise<void> | void;
  }>;

  constructor(
    private _router: Router,
    private _menuCtrl: MenuController,
    private _platform: Platform,
    private _generalInfo: GeneralInfoService,
    private _modal: ModalsService,
    private renderer: Renderer2
  ) {
    this._platform.ready().then(() => {
      // const safeAreaTop = window
      //   .getComputedStyle(document.documentElement)
      //   .getPropertyValue('env(safe-area-inset-top)');

      // if (!safeAreaTop || safeAreaTop.trim().length == 0) {
      //   document.documentElement.style.setProperty(
      //     '--ion-safe-area-top',
      //     '30px'
      //   );
      // }

      // this.renderer.setStyle(
      //   document.documentElement,
      //   '--ion-safe-area-top',
      //   safeAreaTop
      // );
    });

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

  async ngOnInit() {
    await this.onInit();
  }

  private async onInit() {
    await StatusBar.setOverlaysWebView({
      overlay: false,
    });
    await StatusBar.setBackgroundColor({ color: '#2dd55b' });
    StatusBar.show();

    await this._generalInfo.initStorage();

    let info: IGeneralInfo | undefined =
      await this._generalInfo.getGeneralInfo();
    if (info) {
      if (info.isFirstTime) {
        info!.isFirstTime = false;
        await this._generalInfo.update(info);
      }
      return;
    }

    info = {
      id: 1,
      isFirstTime: true,
    };

    await this._generalInfo.insert(info);

    await this._modal.showFirstOpenedModal();
  }

  private async goTo(path: string) {
    await this._router.navigate([path]);
    this._menuCtrl.close();
  }
}
