import { Component, OnInit, ViewChild } from "@angular/core";
import {
  IonApp,
  IonRouterOutlet,
} from "@ionic/angular/standalone";
import { StatusBar } from "@capacitor/status-bar";
import { GeneralInfoService } from "./services/local/general-info/general-info.service";
import { IGeneralInfo } from "./models/general-info.model";
import { ModalsService } from "./services/modals/modals.service";
import { ScreenOrientation } from "@capacitor/screen-orientation";

//DO NOT REMOVE
import { ProductComponent } from "./components/modals/product/product.component";
import { FilesService } from "./services/files/files.service";
import { States } from "./services/constants";
import { GlobalService } from "./services/global/global.service";
import { ToastService } from "./services/toast/toast.service";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { OrdersWsService } from "./services/web-socket/orders/orders-ws.service";
import { NotificationsService } from "./services/notifications/notifications.service";
import { AlertsService } from "./services/alerts/alerts.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  imports: [
    IonApp,
    IonRouterOutlet,
    //DO NOT REMOVE
    ProductComponent,

  ],
})
export class AppComponent implements OnInit {
  // public static loadingData = new EventEmitter<boolean>();

  @ViewChild('outlet', { static: true }) outlet?: IonRouterOutlet;

  constructor(
    private _generalInfo: GeneralInfoService,
    private _modal: ModalsService,
    private _file: FilesService,
    private _global: GlobalService,
    private _toast: ToastService,
    private _ordersWs: OrdersWsService,
    private _notifications: NotificationsService,
    private _alert: AlertsService
  ) {
    

    ScreenOrientation.lock({ orientation: "portrait" })
      .then(() => {
        console.log("Screen locked to portrait");
      })
      .catch(async (err) => {
        await this._file.saveError(err);
      });

    this._notifications.init();

    

    Keyboard.addListener("keyboardWillShow", (info) => {
      // Opcional: cambiar modo de resize en caliente
      Keyboard.setResizeMode({ mode: KeyboardResize.None });
      // Scroll manual a la posición del input activo
      setTimeout(() => {
        const el: any = document.activeElement;
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    });

    Keyboard.addListener("keyboardWillHide", () => {
      Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    });
  }

  async ngOnInit() {
    await this.onInit();
    this._global.SyncData().then((result) => {
      if (result) this._toast.showToast("Datos sincronizados");

      this._ordersWs.connect()?.subscribe(order => {
        this._notifications.scheduleImmediate(
          'Nuevo pedido', `${order.name} hizo un pedido`, undefined, `/orders/detail/${order.id}`
        );
      });

    });

    this.outlet?.stackWillChange.subscribe(async () => {
      await this._alert.showLoading('show');
    });

    this.outlet?.stackDidChange.subscribe(async () => {
      await this._alert.showLoading('close');
    });
  }

  private async onInit() {
    // AppComponent.loadingData.emit(true);
    // AppComponent.updateData.emit();
    await StatusBar.setOverlaysWebView({
      overlay: false,
    });
    await StatusBar.setBackgroundColor({ color: "#2dd55b" });
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
    this._file.deleteTempData();

    // this._ordersWs.connect()?.subscribe(order => {
    //   console.log(order);
    // });
  }

  
}
