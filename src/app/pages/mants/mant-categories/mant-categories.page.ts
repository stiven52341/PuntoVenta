import { TitleCasePipe } from '@angular/common';
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
import { search, camera, save, trash, checkmarkCircle } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { ICategory } from 'src/app/models/category.model';
import { PhotoKeys, States } from 'src/app/models/constants';
import { IImageCategory } from 'src/app/models/image-category.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { CategoryService } from 'src/app/services/api/category/category.service';
import { ImageCategoryService } from 'src/app/services/api/image-category/image-category.service';
import { FilesService } from 'src/app/services/files/files.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
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
  providers: [TitleCasePipe],
})
export class MantCategoriesPage implements OnInit {
  protected image: string;
  private noImage: string;
  protected category?: ICategory;
  protected form: FormGroup;
  protected loading: boolean = false;
  protected options: Array<IButton>;

  constructor(
    private _alert: AlertsService,
    private _photo: PhotosService,
    private _modal: ModalsService,
    private _localCategory: LocalCategoriesService,
    private _category: CategoryService,
    private _file: FilesService,
    private _global: GlobalService,
    private _title: TitleCasePipe,
    private _catogoryPhotos: ImageCategoryService
  ) {
    this.noImage = '../../../../assets/no-image.png';
    this.image = this.noImage;
    addIcons({ search, camera, save, trash, checkmarkCircle });

    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      desc: new FormControl(null, [Validators.maxLength(255)]),
    });

    this.options = [
      {
        title: 'Limpiar',
        do: () => {
          this.clearForm(true);
        },
      },
    ];
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
    this.form.get('desc')?.setValue(this.category?.description);
  }

  private checkForm(): boolean {
    if (this.form.get('name')?.invalid) {
      this._alert.showError('Nombre inválido');
      return false;
    }

    if (this.form.get('desc')?.invalid) {
      this._alert.showError('Descripción inválido');
      return false;
    }

    if (this.form.invalid) {
      this._alert.showError('Formulario inválido');
      return false;
    }

    return true;
  }

  protected async onSave() {
    if (!this.checkForm()) return;
    if (
      !(await this._alert.showConfirm(
        'CONFIRME',
        this.category
          ? '¿Está seguro de modificar la categoría?'
          : '¿Está seguro de guardar la categoría?'
      ))
    )
      return;

    this.loading = true;

    const newCategory: ICategory = {
      id: await this._localCategory.getNextID(),
      name: this._title
        .transform(this.form.get('name')!.value as string)
        .trim(),
      description: this._title
        .transform((this.form.get('desc')?.value || '') as string)
        .trim(),
      state: true,
      uploaded: States.NOT_INSERTED,
    };

    if (!this.category) {
      const result = await this._category.insert(newCategory).catch((err) => {
        this._file.saveError(err);
        return undefined;
      });

      newCategory.uploaded = result ? States.SYNC : States.NOT_INSERTED;

      
      if (this.image != this.noImage) {
        const imageCategory: IImageCategory = {
          id: result as number,
          data: this.image.replace('data:image/png;base64,',''),
          state: true,
          uploaded: States.NOT_INSERTED,
        };

        await firstValueFrom(
          forkJoin([
            this._photo.savePhoto(
              newCategory.id.toString(),
              this.image,
              PhotoKeys.CATEGORIES_ALBUM
            ),
            this._catogoryPhotos.insert(imageCategory),
          ])
        );
      }

      await this._localCategory
        .insert(newCategory)
        .then(() => {
          this._alert.showSuccess('Categoría guardada');
          this._global.updateData();
          this.clearForm();
        })
        .catch((err) => {
          this._alert.showError('Error guardando categoría');
          this._file.saveError(err);
        })
        .finally(() => {
          this.loading = false;
        });
    } else {
      newCategory.id = this.category.id;
      const result = await this._category.update(newCategory).catch((err) => {
        this._file.saveError(err);
        return false;
      });

      newCategory.uploaded = result ? States.SYNC : States.NOT_UPDATED;

      if (this.image != this.noImage) {
        const imageCategory: IImageCategory = {
          id: this.category.id,
          data: this.image.replace('data:image/png;base64,',''),
          state: true,
          uploaded: States.NOT_INSERTED
        };

        await firstValueFrom(forkJoin([
          this._photo.savePhoto(
            newCategory.id.toString(),
            this.image,
            PhotoKeys.CATEGORIES_ALBUM
          ),
          this._catogoryPhotos.insert(imageCategory)
        ]));
      }

      await this._localCategory
        .update(newCategory)
        .then(() => {
          this._alert.showSuccess('Categoría actualizada');
          this._global.updateData();
          this.clearForm();
        })
        .catch((err) => {
          this._alert.showError('Error actualizando categoría');
          this._file.saveError(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  protected async clearForm(showConfirm: boolean = false) {
    if (showConfirm) {
      if (
        !(await this._alert.showConfirm(
          'CONFIRME',
          '¿Está seguro de limpiar el formulario?'
        ))
      )
        return;
    }

    this.form.reset();
    this.image = this.noImage;
    this.category = undefined;
  }

  protected async onDeactivate(){
    if(!this.category)return;

    const result = await this._alert.showConfirm('CONFIRME', '¿Está seguro de desactivar esta categoría?');
    if(!result) return;

    const deleted = await this._category.delete(this.category);
    this.category.uploaded = deleted ? States.SYNC : States.NOT_DELETED;
    this._localCategory.deactivate(this.category).then(() => {
      this._alert.showSuccess('CATEGORÍA DESACTIVADA');
      this.clearForm();
    }).catch(err => {
      this._alert.showError('Error desactivando categoría');
      this._file.saveError(err);
    });
  }

  protected async onActivate(){
    if(!this.category)return;

    const result = await this._alert.showConfirm('CONFIRME', '¿Está seguro de reactivar esta categoría?');
    if(!result) return;

    this.category.state = true;
    const activated = await this._category.update(this.category);

    this.category.uploaded = activated ? States.SYNC : States.NOT_UPDATED;
    this._localCategory.update(this.category).then(() => {
      this._alert.showSuccess('CATEGORÍA REACTIVADA');
      this.clearForm();
    }).catch(err => {
      this._alert.showError('Error reactivando categoría');
      this._file.saveError(err);
    });
  }
}
