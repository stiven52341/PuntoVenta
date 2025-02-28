import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonSearchbar, IonLabel } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { ProductCardComponent } from 'src/app/components/product-card/product-card.component';
import { ICategory } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/api/category/category.service';
import { CategoryCardComponent } from 'src/app/components/category-card/category-card.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonLabel, CategoryCardComponent,IonSearchbar, ProductCardComponent,IonContent,HeaderBarComponent, IonHeader]
})
export class ProductsPage implements OnInit {
  protected categories: Array<ICategory> = [];
  protected loading: boolean = false;

  constructor(private _categories: CategoryService) { }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit(){
  }
}
