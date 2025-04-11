import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonButton } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';

@Component({
  selector: 'app-mant-products',
  templateUrl: './mant-products.page.html',
  styleUrls: ['./mant-products.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, HeaderBarComponent]
})
export class MantProductsPage implements OnInit {
  protected image?: string;
  protected loading: boolean = false;
  protected title: string = 'NUEVO PRODUCTO';

  protected product?: IProduct;

  constructor(private _photo: PhotosService, private _modal: ModalsService) { }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit(){
    this.image = '../../../../assets/no-image.png';
  }

  protected async onSearchProduct(){
    const result = await this._modal.showProductListModal();
    if(!result)return;
    this.title = 'modificando producto';
    this.product = result.product;
    this.image = result.image;
  }
}
