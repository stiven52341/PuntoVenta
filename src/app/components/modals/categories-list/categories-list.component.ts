import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonContent,
  ModalController,
  IonSearchbar,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { ICategory } from 'src/app/models/category.model';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonList,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonSearchbar,
    NgClass,
  ],
})
export class CategoriesListComponent implements OnInit {
  protected loading: boolean = false;
  protected categories: Array<ICategory> = [];
  protected categoriesFiltered: Array<{ category: ICategory; image: string }> =
    [];

  private readonly noImage: string;
  private readonly imageLoading: string;

  constructor(
    private _modalCtrl: ModalController,
    private _categories: LocalCategoriesService,
    private _photo: PhotosService
  ) {
    this.noImage = '../../../../assets/no-image.png';
    this.imageLoading = '../../../../assets/icon/loading.gif';
  }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    this.categories = await this._categories.getAll();
    this.generateItems(this.categories);
  }

  public async onClose(info: { category: ICategory; image: string }) {
    if (this.loading) return;
    await this._modalCtrl.dismiss(info);
  }

  protected async generateItems(
    categories: Array<ICategory>,
    offset: number = 25
  ) {
    const count = this.categoriesFiltered.length;

    const newList: Array<{ category: ICategory; image: string }> = [];
    for (let i = 0; i < offset; i++) {
      if (categories[i + count]) {
        this._photo
          .getPhoto(
            categories[i + count].id.toString(),
            PhotoKeys.CATEGORIES_ALBUM
          )
          .then((image) => {
            const imageStr = image || this.noImage;
            const index = this.categoriesFiltered.findIndex(
              (category) => category.category.id == categories[i + count].id
            );
            this.categoriesFiltered[index].image = imageStr;
          });

        newList.push({
          category: categories[i + count],
          image: this.imageLoading,
        });
      }
    }

    this.categoriesFiltered.push(...newList);
  }

  protected async onSearch($event: CustomEvent) {
    this.loading = true;
    const value = ($event.detail.value as string).trim().toLowerCase();

    const newList = this.categories.filter((category) => {
      return (
        category.id.toString().trim().toLowerCase().includes(value) ||
        category.name.trim().toLowerCase().includes(value)
      );
    });

    this.categoriesFiltered = [];
    this.generateItems(newList);
    this.loading = true;
  }
}
