import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { StatusBar } from '@capacitor/status-bar';
import { GeneralInfoService } from './services/local/general-info/general-info.service';
import { IGeneralInfo } from './models/general-info.model';
import { ModalsService } from './services/modals/modals.service';
import { ScreenOrientation } from '@capacitor/screen-orientation';

//DO NOT REMOVE
import { ProductComponent } from './components/modals/product/product.component';
import { IButton } from './models/button.model';
import { ButtonListComponent } from './components/button-list/button-list.component';
import { FilesService } from './services/files/files.service';
import { PhotosService } from './services/photos/photos.service';
import { States } from './models/constants';
import { GlobalService } from './services/global/global.service';
import { ToastService } from './services/toast/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    //DO NOT REMOVE
    ProductComponent,
    IonContent,
    ButtonListComponent,
  ],
})
export class AppComponent implements OnInit {
  // public static loadingData = new EventEmitter<boolean>();

  protected menuOptions: Array<IButton>;

  constructor(
    private _router: Router,
    private _menuCtrl: MenuController,
    private _generalInfo: GeneralInfoService,
    private _modal: ModalsService,
    private _file: FilesService,
    private _global: GlobalService,
    private _toast: ToastService
  ) {
    ScreenOrientation.lock({ orientation: 'portrait' })
      .then(() => {
        console.log('Screen locked to portrait');
      })
      .catch(async (err) => {
        await this._file.saveError(err);
      });

    this.menuOptions = [
      {
        title: 'Caja',
        image: '../assets/icon/cash.png',
        do: async () => {
          await this.goTo('/cash-box');
        },
      },
      {
        title: 'Productos',
        image: '../assets/icon/apple.png',
        do: async () => {
          await this.goTo('/products');
        },
      },
      {
        title: 'Carrito',
        image: '../assets/icon/cart.png',
        do: async () => {
          await this.goTo('/cart');
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
      {
        title: 'Consultas',
        image: '../assets/icon/search.png',
        do: async () => {
          await this.goTo('/consults');
        },
      },
    ];

    addIcons({});
  }

  async ngOnInit() {
    await this.onInit();
    this._global.SyncData().then((result) => {
      if (result) this._toast.showToast('Datos sincronizados');
    });
  }

  private async onInit() {
    // AppComponent.loadingData.emit(true);
    // AppComponent.updateData.emit();
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
      // AppComponent.loadingData.emit(false);
      this._global.updateData();
      return;
    }

    info = {
      id: 1,
      isFirstTime: true,
      state: true,
      uploaded: States.NOT_SYNCABLE,
    };

    await this._generalInfo.insert(info);

    await this._modal.showFirstOpenedModal();
    // AppComponent.loadingData.emit(false);
    this._global.updateData();
  }

  private async goTo(path: string) {
    await this._router.navigate([path]);
    this._menuCtrl.close();
  }
}
