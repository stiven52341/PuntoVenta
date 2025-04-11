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
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { IProduct } from 'src/app/models/product.model';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { firstValueFrom, forkJoin } from 'rxjs';

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
  ],
})
export class ProductListComponent implements OnInit {
  protected loading: boolean = false;

  protected products: Array<{ product: IProduct; image: string }> = [];
  protected productsFiltered: Array<{ product: IProduct; image: string }> = [];

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
    const products = await this._products.getAll();
    const pros = products.map(async (product) => {
      const photo = await this._photo.getPhoto(
        product.id.toString(),
        PhotoKeys.PRODUCTS_ALBUMN
      );
      this.products.push({
        product: product,
        image: photo || '../../../../assets/no-image.png',
      });
    });
    await firstValueFrom(forkJoin(pros));

    this.generateItems(this.products);
  }

  private generateItems(
    products: Array<{ product: IProduct; image: string }>,
    offset: number = 50
  ) {
    const count = this.productsFiltered.length;

    for (let i = 0; i < offset; i++) {
      if (products[count + i]) {
        this.productsFiltered.push(products[count + i]);
      }
    }
  }
  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems(this.products);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected onSearch($event: CustomEvent) {
    const value = $event.detail.value as string;
    const newList = this.products.filter((product) => {
      return (
        product.product.id.toString().includes(value.toLowerCase().trim()) ||
        product.product.name
          .trim()
          .toLowerCase()
          .includes(value.trim().toLowerCase()) ||
        product.product.description
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
