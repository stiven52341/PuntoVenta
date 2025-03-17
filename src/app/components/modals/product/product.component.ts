import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonButton, IonIcon, IonLabel, IonItem } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { addIcons } from 'ionicons';
import { heart, shareSocial } from 'ionicons/icons';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { UpperCasePipe } from '@angular/common';
import { IProductCategory } from 'src/app/models/product-category.model';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { ICategory } from 'src/app/models/category.model';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [UpperCasePipe,IonLabel, IonIcon, IonButton, IonButton, IonHeader, HeaderBarComponent, IonContent]
})
export class ProductComponent implements OnInit {
  @Input({required:true}) product!: IProduct;
  @Input() unitProduct!: IUnitProduct;
  @Input() image?: string;
  @Input() productCategories?: Array<IProductCategory> = [];

  protected categories: Array<ICategory> = [];

  constructor(private _categories: LocalCategoriesService) {
    addIcons({heart, shareSocial});
  }

  async ngOnInit() {
    if(this.productCategories && this.productCategories.length > 0){
      this.categories = (await this._categories.getAll()).filter(
        category => {
          return this.productCategories?.some(pc => pc.id.id_category == category.id);
        }
      );
    }
  }

}
