import { Component, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonSearchbar,
  ModalController,
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { IProduct } from 'src/app/models/product.model';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonItem,
    IonList,
    IonHeader,
    IonContent,
    HeaderBarComponent,
    IonSearchbar,
    NgClass,
    IonToolbar
  ],
})
export class ProductListComponent implements OnInit {
  protected loading: boolean = false;

  @Input() showOnlyActiveProducts: boolean = false;

  protected products: Array<IProduct>= [];
  protected productsFiltered: Array<{ product: IProduct; image: string }> = [];

  private loadingSub?: Subscription;

  private readonly noImage = '../../../../assets/no-image.png';
  private readonly loadingImage = '../../../../assets/icon/loading.gif';

  constructor(
    private _modalCtrl: ModalController,
    private _products: LocalProductsService,
    private _photo: PhotosService
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    const products = this.showOnlyActiveProducts
      ? (await this._products.getAll())
          .filter((pro) => pro.state)
          .sort((a, b) => Number(a.id) - Number(b.id))
      : (await this._products.getAll()).sort((a, b) => Number(a.id) - Number(b.id));

    this.products = products;
    this.productsFiltered = [];
    this.generateItems(this.products)
  }

  private generateItems(
    products: Array<IProduct>,
    offset: number = 15
  ) {
    const count = this.productsFiltered.length;

    for(let i = 0; i < offset; i++){
      if(products[i + count]){
        const product = products[i + count];
        let imageStr: string = this.loadingImage;
        this._photo.getPhoto(product.id.toString(),PhotoKeys.PRODUCTS_ALBUMN).then(image => {
          imageStr = image || this.noImage
          const index = this.productsFiltered.findIndex(pro => +pro.product.id == +product.id);
          this.productsFiltered[index].image = imageStr;
        });
        this.productsFiltered.push({product: product, image: imageStr});
      }
    }
  }

  async onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems(this.products)
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected async onSearch($event: CustomEvent) {
    const value = $event.detail.value as string;
    const newList = this.products.filter((product) => {
      return (
        product.id.toString().includes(value.toLowerCase().trim()) ||
        product.name
          .trim()
          .toLowerCase()
          .includes(value.trim().toLowerCase()) ||
        product.description
          ?.trim()
          .toLowerCase()
          .includes(value.trim().toLowerCase())
      );
    });
    this.productsFiltered = [];
    this.generateItems(newList);
  }

  protected async onClick(product: { product: IProduct; image: string }) {
    await this._modalCtrl.dismiss(product);
  }
}
