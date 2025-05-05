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
import { firstValueFrom, forkJoin, Observable, Subscription } from 'rxjs';
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
  ],
})
export class ProductListComponent implements OnInit {
  protected loading: boolean = false;

  @Input() showOnlyActiveProducts: boolean = false;

  protected products: Array<{ product: IProduct; image: string }> = [];
  protected productsFiltered: Array<{ product: IProduct; image: string }> = [];

  private loadingSub?: Subscription;

  private readonly noImage = '../../../../assets/no-image.png';

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
          .sort((a, b) => a.id - b.id)
      : (await this._products.getAll()).sort((a, b) => a.id - b.id);
    const pros = products.map(async (product) => {
      this.products.push({
        product: product,
        image: this.noImage,
      });
    });
    await firstValueFrom(forkJoin(pros));

    await firstValueFrom(this.generateItems(this.products));
  }

  private generateItems(
    products: Array<{ product: IProduct; image: string }>,
    offset: number = 15
  ): Observable<void> {
    return new Observable<void>((ob) => {
      this.loading = true;

      const count = this.productsFiltered.length;

      const newList: Array<{ product: IProduct; image: string }> = [];
      for (let i = 0; i < offset; i++) {
        if (
          products[count + i] &&
          !this.productsFiltered.some(
            (pro) => +pro.product.id == +products[count + i].product.id
          )
        ) {
          newList.push(products[count + i]);
        }
      }

      const pros = newList.map(async (product) => {
        if (product.image == this.noImage) {
          product.image =
            (await this._photo.getPhoto(
              product.product.id.toString(),
              PhotoKeys.PRODUCTS_ALBUMN
            )) || this.noImage;
        }
      });

      forkJoin(pros).subscribe({
        next: () => {
          this.productsFiltered.push(...newList);
          ob.next();
        },
        complete: () => {
          ob.complete();
        }
      });
    });
  }

  async onIonInfinite(event: InfiniteScrollCustomEvent) {
    await firstValueFrom(this.generateItems(this.products));
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected async onSearch($event: CustomEvent) {
    this.loading = true;

    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
      this.loadingSub = undefined;
    }

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
    this.loadingSub = this.generateItems(newList).subscribe({
      complete: () => {
        this.loading = false;
      },
    });
  }

  protected async onClick(product: { product: IProduct; image: string }) {
    await this._modalCtrl.dismiss(product);
  }
}
