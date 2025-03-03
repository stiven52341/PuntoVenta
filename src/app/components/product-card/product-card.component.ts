import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cart, cartOutline } from 'ionicons/icons';
import { IProduct } from 'src/app/models/product.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class ProductCardComponent  implements OnInit {
  @Input({required:true}) product!: IProduct;
  @Input() image?: string;
  protected unitProduct?: IUnitProduct;

  @Output() loadingEvent = new EventEmitter<boolean>();

  constructor(private _unitProducts: LocalUnitProductsService) {
    addIcons({cartOutline});
  }

  async ngOnInit() {
    this.loadingEvent.emit(true);
    await this.onInit();
    this.loadingEvent.emit(false);
  }

  private async onInit(){
    const units = (await this._unitProducts.getAll()).filter(unit => {
      return unit.id.id_product == this.product.id
    });

    this.unitProduct = units.find(unit => unit.isDefault == true);
  }
}
