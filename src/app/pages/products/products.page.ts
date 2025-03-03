import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonSearchbar,
  IonLabel,
  InfiniteScrollCustomEvent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { ProductCardComponent } from 'src/app/components/product-card/product-card.component';
import { ICategory } from 'src/app/models/category.model';
import { CategoryCardComponent } from 'src/app/components/category-card/category-card.component';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { NgFor } from '@angular/common';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { IProduct } from 'src/app/models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    CategoryCardComponent,
    IonSearchbar,
    ProductCardComponent,
    IonContent,
    HeaderBarComponent,
    IonHeader,
    IonSpinner
  ],
})
export class ProductsPage implements OnInit {
  protected categories: Array<{ category: ICategory; image?: string }> = [];
  private products: Array<{ product: IProduct; image?: string }> = [];
  protected productsFiltered: Array<{ product: IProduct; image?: string }> = [];

  protected loading: boolean = false;
  protected loadingScroll: boolean = false;

  constructor(
    private _categories: LocalCategoriesService,
    private _photo: PhotosService,
    private _products: LocalProductsService
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    await this.loadProducts();
    this.generateItems(this.products);
  }

  private async loadProducts() {
    const data = await firstValueFrom(
      forkJoin([this._categories.getAll(), this._products.getAll()])
    );

    const getPhotosCategories = async (category: ICategory) => {
      const image = await this._photo.getPhoto(
        category.id.toString(),
        PhotoKeys.CATEGORIES_ALBUM
      );
      this.categories.push({
        category: category,
        image: image,
      });
    };

    for (const category of data[0]) {
      await getPhotosCategories(category);
    }

    const getPhotosProducts = async (product: IProduct) => {
      const image = await this._photo.getPhoto(
        product.id.toString(),
        PhotoKeys.PRODUCTS_ALBUMN
      );
      this.products.push({
        product: product,
        image: image,
      });
    };

    for(const product of data[1]){
      await getPhotosProducts(product);
    }
  }

  private generateItems(
    products: Array<{ product: IProduct; image?: string }>
  ) {
    const count = this.productsFiltered.length;

    for (let i = 0; i < 10; i++) {
      if (products[i + count]) {
        this.productsFiltered.push(products[i + count]);
      }
    }
  }

  protected onScroll($event: Event){
    if(this.productsFiltered.length >= this.products.length) return;

    this.loadingScroll = true;
    const target = $event.target as HTMLElement;

    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const offsetHeight = target.offsetHeight;

    if(scrollTop + offsetHeight >= scrollHeight - 5){
      this.generateItems(this.products);
      setTimeout(() => this.loadingScroll = false, 500);
    }
  }
}
