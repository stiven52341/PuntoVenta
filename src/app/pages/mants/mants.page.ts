import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { IonContent, IonHeader } from "@ionic/angular/standalone";
import { ButtonListComponent } from "src/app/components/elements/button-list/button-list.component";
import { HeaderBarComponent } from "src/app/components/elements/header-bar/header-bar.component";
import { IButton } from "src/app/models/button.model";
import { AlertsService } from "src/app/services/alerts/alerts.service";
import { LocalProductsService } from "src/app/services/local/local-products/local-products.service";
import { ModalsService } from "src/app/services/modals/modals.service";
import { NetworkService } from "src/app/services/network/network.service";

@Component({
  selector: "app-mants",
  templateUrl: "./mants.page.html",
  styleUrls: ["./mants.page.scss"],
  standalone: true,
  imports: [
    IonContent,
    HeaderBarComponent,
    IonHeader,
    FormsModule,
    ButtonListComponent,
  ],
})
export class MantsPage implements OnInit {
  protected readonly buttons: Array<IButton>;
  protected loading: boolean = false;

  constructor(
    private _router: Router,
    private _alert: AlertsService,
    private _modal: ModalsService,
    private _localProduct: LocalProductsService,
    private _network: NetworkService
  ) {
    this.buttons = [
      {
        title: "PRODUCTOS",
        do: async () => {
          await this._router.navigate(["/mant/products"]);
        },
        image: "../../../assets/icon/apple.png",
      },
      {
        title: "PRECIOS",
        do: async () => {
          await this._router.navigate(["/mant/prices"]);
        },
        image: "../../../assets/icon/price.png",
      },
      {
        title: "UNIDADES",
        do: async () => {
          await this._router.navigate(["/mant/units"]);
        },
        image: "../../../assets/icon/box.png",
      },
      {
        title: "CATEGORÍAS",
        do: async () => {
          await this._router.navigate(["/mant/categories"]);
        },
        image: "../../../assets/icon/category.png",
      },
      {
        title: "Establecer unidad base para todos los productos",
        image: "../../../assets/icon/box-income.png",
        do: async () => {
          this.loading = true;

          if (!(await this._network.isInternetAvailable())) {
            await this._alert.showError(
              "Esta acción require internet obligatoriamente"
            );
            return;
          }

          const adv1 = await this._alert.showConfirm(
            "Advertencia",
            `Si establece una unidad base para todos los artículos,
            se sobreescribirán aquellas que ya tengan una definida. ¿Está seguro de continuar?`,
            "warning"
          );

          if (!adv1) return;

          const unit = await this._modal.showUnitsList();
          if (!unit) {
            this._alert.showError("Debe seleccionar una unidad");
            return;
          }

          const adv2 = await this._alert.showConfirm(
            "CONFIRME",
            `¿Está seguro de asignar como unidad base la unidad <b>${unit.name}</b>
            para todos los productos?`
          );
          if (!adv2) return;

          this.loading = true;
          this._localProduct
            .setBaseUnitForAllProducts(+unit.id)
            .then(() => {
              this._alert.showSuccess(`Unidad <b>${unit.name}</b> asignada
              como unidad base a todos los productos`);
            })
            .catch(() => {
              this._alert.showError(
                "Error asignando unidad base a todos los productos"
              );
            })
            .finally(() => (this.loading = false));
        },
      },
    ];
  }

  ngOnInit() {}
}
