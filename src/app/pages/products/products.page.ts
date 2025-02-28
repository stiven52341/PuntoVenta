import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonSearchbar, IonLabel } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { ProductCardComponent } from 'src/app/components/product-card/product-card.component';
import { ICategory } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/api/category/category.service';
import { CategoryCardComponent } from 'src/app/components/category-card/category-card.component';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotosService } from 'src/app/services/photos/photos.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonLabel, CategoryCardComponent,IonSearchbar, ProductCardComponent,IonContent,HeaderBarComponent, IonHeader]
})
export class ProductsPage implements OnInit {
  protected categories: Array<{category: ICategory, image?: string}> = [];
  protected loading: boolean = false;

  constructor(private _categories: LocalCategoriesService, private _photo: PhotosService) { }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit(){
    const data = await firstValueFrom(forkJoin([
      this._categories.getAll()
    ]));

    data[0].forEach(category => {
      this.categories.push({category: category})
    });
  }
}
