import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonIcon, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';
import { IProduct } from 'src/app/models/product.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { LocalInventoryService } from 'src/app/services/local/local-inventory/local-inventory.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [IonIcon, IonImg, DecimalPipe],
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: IProduct;
  @Input() image?: string;
  @Input({ required: true }) unitProduct?: IUnitProduct;

  @Output() loadingEvent = new EventEmitter<boolean>();

  constructor(
    private _unitProducts: LocalUnitProductsService,
    private _cats: LocalCategoriesService,
    private _invetory: LocalInventoryService
  ) {
    addIcons({ cartOutline });
  }

  async ngOnInit() {
    this.loadingEvent.emit(true);
    await this.onInit();
    this.loadingEvent.emit(false);
  }

  private async onInit() {
    const units = (await this._unitProducts.getAll()).filter((unit) => {
      return unit.idProduct == this.product.id;
    });

    this.unitProduct = units.find((unit) => unit.isDefault == true);
    if(!this.unitProduct){
      this.unitProduct = units[0];
    }
  }
}
