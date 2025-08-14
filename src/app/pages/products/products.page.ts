import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonSearchbar,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent, IonToolbar,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent
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
import { ModalsService } from 'src/app/services/modals/modals.service';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalProductCategoryService } from 'src/app/services/local/local-product-category/local-product-category.service';
import { IProductCategory } from 'src/app/models/product-category.model';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { GlobalService } from 'src/app/services/global/global.service';

interface IProductDetail {
  product: IProduct;
  unitProduct: IUnitProduct;
  image?: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonToolbar,
    IonLabel,
    CategoryCardComponent,
    IonSearchbar,
    ProductCardComponent,
    IonContent,
    HeaderBarComponent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent
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
  private readonly noImage: string = '../../../assets/no-image.png';
  @ViewChild('searchBar', {static: false}) searchBar!: IonSearchbar;

  // private generating: boolean = false;

  constructor(
    private _categories: LocalCategoriesService,
    private _photo: PhotosService,
    private _products: LocalProductsService,
    private _modal: ModalsService,
    private _unitProduct: LocalUnitProductsService,
    private _productCategory: LocalProductCategoryService,
    private _global: GlobalService,
  ) { }

  async ngOnInit() {
    this._global.listenToChanges().subscribe(async () => {
      await this.onReset();
    });
  }

  private async onInit() {
    await this.loadProducts();
    await this.generateItems(this.products);
  }

  private async loadProducts() {

    this.categories = [];
    this.products = [];
    this.productsFiltered = [];
    // this._cdr.detectChanges();

    const data = await firstValueFrom(
      forkJoin([
        this._categories.getAll(),
        this._products.getAll(),
        this._unitProduct.getAll(),
        this._productCategory.getAll(),
      ])
    );

    const unitProducts = data[2].filter((uni) => uni.state == true);
    const productCategories = data[3].filter((pro) => pro.state == true);

    data[0].forEach((category) => {
      this.categories.push({
        category: category,
        image: '../../../assets/icon/loading.gif',
      });
    });

    for (const category of this.categories) {
      this._photo
        .getPhoto(category.category.id.toString(), PhotoKeys.CATEGORIES_ALBUM)
        .then((image) => {
          category.image = image || this.noImage;
        });
    }

    const assignProducts = (product: IProduct) => {
      this.products.push({
        product: product,
        unitProduct: unitProducts.find(
          (u) => u.idProduct == product.id && u.isDefault && u.state
        )!,
        image: undefined,
        categories: productCategories.filter(
          (c) => c.id.idProduct == product.id
        ),
      });
    };

    for (const product of data[1]) {
      if (!product.state) continue;
      assignProducts(product);
    }
  }

  protected async generateItems(
    products: Array<IProductDetail>,
    offset: number = 10
  ) {
    //
    if (products.length == 0) return;

    const count = this.productsFiltered.length;

    const newList: Array<IProductDetail> = [];
    for (let i = 0; i < offset; i++) {
      if (
        products[i + count] &&
        !this.productsFiltered.some(
          (pro) => +pro.product.id == +products[i + count].product.id
        )
      ) {
        const product = products[i + count];
        newList.push(product);
      }
    }


    for (const product of newList) {
      if (!product.image || product.image == '') {
        product.image = '../../../assets/icon/loading.gif';
        this.getPhotoProduct(product.product).then((data) => {
          product.image = data || this.noImage;
        });
      }
    }

    // await firstValueFrom(forkJoin(pros));
    this.productsFiltered.push(...newList);
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

  protected async search($event: CustomEvent) {
    const search = ($event.detail.value as string).trim().toLowerCase();

    const newList = this.products.filter((product) => {
      return product.product.name.toLowerCase().trim().includes(search);
    });

    this.productsFiltered = [];
    this.loading = true;
    await this.generateItems(newList);
    this.loading = false;
  }

  protected async filterByCategory(category: ICategory) {
    if (this.loading) return;

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
      this.loading = true;
      await this.generateItems(newList);
      this.loading = false;
    }
  }

  protected async reset() {
    this.loading = true;
    this.productsFiltered = [];
    this.selectedCategory = undefined;
    await this.generateItems(this.products);
    this.loading = false;
  }

  private async getPhotoProduct(product: IProduct) {
    return await this._photo.getPhoto(
      product.id.toString(),
      PhotoKeys.PRODUCTS_ALBUMN
    );
  }

  async onIonInfinite(event: InfiniteScrollCustomEvent) {
    await this.generateItems(this.products);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected async onReset($event?: RefresherCustomEvent) {
    this.loading = true;
    this.searchBar.value = '';
    await this.onInit();
    this.loading = false;
    $event?.target.complete();
  }
}
