import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonIcon,
  IonLabel,
  IonInput,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, camera, save, trash } from 'ionicons/icons';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { ICategory } from 'src/app/models/category.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';

@Component({
  selector: 'app-mant-categories',
  templateUrl: './mant-categories.page.html',
  styleUrls: ['./mant-categories.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonLabel,
    IonIcon,
    IonButton,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonFooter,
    ReactiveFormsModule,
  ],
})
export class MantCategoriesPage implements OnInit {
  protected image: string;
  private noImage: string;
  protected category?: ICategory;
  protected form: FormGroup;

  constructor(
    private _alert: AlertsService,
    private _photo: PhotosService,
    private _modal: ModalsService
  ) {
    this.noImage = '../../../../assets/no-image.png';
    this.image = this.noImage;
    addIcons({ search, camera, save, trash });

    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      desc: new FormControl(null, [Validators.maxLength(255)]),
    });
  }

  ngOnInit() {}

  async onChangePhoto() {
    await this._alert.showOptions(
      'CONFIRME',
      '¿Quiere tomar una foto o seleccionarla de galería?',
      [
        {
          label: 'GALERÍA',
          do: async () => {
            this.image = (await this._photo.openGallery()) || this.noImage;
          },
        },
        {
          label: 'CÁMARA',
          do: async () => {
            this.image = (await this._photo.takePhoto()) || this.noImage;
          },
        },
      ]
    );
  }

  public async onSearch() {
    const result = await this._modal.showCategoriesList();
    this.category = result?.category;
    this.image = result?.image || this.noImage;

    this.form.get('name')?.setValue(this.category?.name);
    this.form.get('desc')?.setValue(this.category?.descr);
  }
}
