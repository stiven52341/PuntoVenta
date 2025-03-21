import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonButton, IonIcon, IonLabel, IonInput, IonTabButton, IonItem } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { CommonModule, DecimalPipe, UpperCasePipe } from '@angular/common';
import { IProductCategory } from 'src/app/models/product-category.model';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { ICategory } from 'src/app/models/category.model';
import { addIcons } from 'ionicons';
import { heart, shareSocial, camera } from 'ionicons/icons';
import { FormsModule, NgModel } from '@angular/forms';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [IonItem, IonTabButton, UpperCasePipe,IonLabel,DecimalPipe,FormsModule, IonIcon,IonInput, IonButton, IonHeader, HeaderBarComponent, IonContent]
})
export class ProductComponent implements OnInit {
  @Input({required:true}) product?: IProduct;
  @Input() unitProduct?: IUnitProduct;
  @Input() image?: string;
  @Input() productCategories?: Array<IProductCategory> = [];

  protected cantidad?: number;

  protected categories: Array<ICategory> = [];

  constructor(private _categories: LocalCategoriesService) {
    addIcons({heart,shareSocial,camera});
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

  protected getTotal(){
    return (this.unitProduct?.price || 0) * (this.cantidad || 0);
  }
}
