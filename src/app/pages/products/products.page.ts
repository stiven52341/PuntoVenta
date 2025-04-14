import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
} from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonSearchbar,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ProductCardComponent } from 'src/app/components/product-card/product-card.component';
import { ICategory } from 'src/app/models/category.model';
import { CategoryCardComponent } from 'src/app/components/category-card/category-card.component';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { IProduct } from 'src/app/models/product.model';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { AppComponent } from 'src/app/app.component';
import { LocalProductCategoryService } from 'src/app/services/local/local-product-category/local-product-category.service';
import { IProductCategory } from 'src/app/models/product-category.model';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';

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
    IonSpinner,
  ],
})
export class ProductsPage implements OnInit {
  protected categories: Array<{ category: ICategory; image?: string }> = [];
  protected products: Array<{
    product: IProduct;
    unitProduct: IUnitProduct;
    image?: string;
    categories?: Array<IProductCategory>;
  }> = [];
  protected productsFiltered: Array<{
    product: IProduct;
    unitProduct: IUnitProduct;
    image?: string;
    categories?: Array<IProductCategory>;
  }> = [];

  protected loading: boolean = false;
  protected loadingScroll: boolean = false;

  protected onSelectCategory = new EventEmitter<ICategory>();
  protected selectedCategory?: ICategory;

  constructor(
    private _categories: LocalCategoriesService,
    private _photo: PhotosService,
    private _products: LocalProductsService,
    private _cart: LocalCartService,
    private _modal: ModalsService,
    private _unitProduct: LocalUnitProductsService,
    private _productCategory: LocalProductCategoryService,
    private _cg: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    AppComponent.loadingData.subscribe(async (loading) => {
      if (!loading) {
        await this.onInit();
      }
    });
  }

  private async onInit() {
    this.loading = true;
    await this.loadProducts();
    this.generateItems(this.products);
    this.loading = false;
  }

  private async loadProducts() {
    this.categories = [];
    this.products = [];
    this.productsFiltered = [];

    const data = await firstValueFrom(
      forkJoin([
        this._categories.getAll(),
        this._products.getAll(),
        this._unitProduct.getAll(),
        this._productCategory.getAll(),
      ])
    );

    const unitProducts = data[2].filter(uni => uni.state == true);
    const productCategories = data[3].filter(pro => pro.state == true);

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
        unitProduct: unitProducts.find(
          (u) => u.idProduct == product.id && u.isDefault
        )!,
        image: image,
        categories: productCategories.filter(
          (c) => c.id.idProduct == product.id
        ),
      });
    };

    for (const product of data[1]) {
      await getPhotosProducts(product);
    }
  }

  protected generateItems(
    products: Array<{
      product: IProduct;
      unitProduct: IUnitProduct;
      image?: string;
    }>,
    offset: number = 10
  ) {
    const count = this.productsFiltered.length;

    for (let i = 0; i < offset; i++) {
      if (
        products[i + count] &&
        !this.productsFiltered.some(
          (pro) => +pro.product.id == +products[i + count].product.id
        )
      ) {
        this.productsFiltered.push(products[i + count]);
      }
    }
  }

  protected onScroll($event: Event) {
    if (this.productsFiltered.length >= this.products.length) return;

    this.loadingScroll = true;
    const target = $event.target as HTMLElement;

    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const offsetHeight = target.offsetHeight;

    if (scrollTop + offsetHeight >= scrollHeight - 5) {
      this.generateItems(this.products);
      setTimeout(() => (this.loadingScroll = false), 700);
    }
  }

  protected async onProductClick(
    product: IProduct,
    unitProduct: IUnitProduct,
    image?: string,
    productCategories?: Array<IProductCategory>
  ) {
    await this._modal.showProductModal(
      product,
      unitProduct,
      image,
      productCategories
    );
  }

  protected search($event: CustomEvent) {
    const search = ($event.detail.value as string).trim().toLowerCase();

    const newList = this.products.filter((product) => {
      return product.product.name.toLowerCase().trim().includes(search);
    });

    this.productsFiltered = [];
    this.generateItems(newList);
  }

  protected filterByCategory(category: ICategory) {
    this.onSelectCategory.emit(category);
    if (this.selectedCategory && +this.selectedCategory.id == +category.id) {
      this.reset();
    } else {
      this.selectedCategory = category;
      const newList = this.products.filter((product) => {
        return (
          product.categories?.some((cat) => {
            return +cat.id.idCategory == +category.id;
          }) || false
        );
      });

      this.productsFiltered = [];
      this.generateItems(newList);
    }
  }

  protected reset() {
    this.productsFiltered = [];
    this.selectedCategory = undefined;
    this.generateItems(this.products);
  }
}
