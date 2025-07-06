import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IImageCategory } from 'src/app/models/image-category.model';
import { ApiKeys } from 'src/app/models/constants';
import { lastValueFrom, timeout } from 'rxjs';
import { PhotosService } from '../../photos/photos.service';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImageCategoryService extends ApiCoreService<IImageCategory> {
  constructor(private _photo: PhotosService) {
    super(ApiKeys.IMAGE_CATEGORIES);
  }

  public override async insert(
    object: IImageCategory
  ): Promise<Number | undefined> {
    const photo = this._photo.base64ToFile(
      object.data,
      'image/png',
      object.id.toString()
    );
    const formData = new FormData();
    formData.append('id', object.id.toString());
    formData.append('file', photo);

    await lastValueFrom(
      this._http.post<HttpEvent<any>>(this.path + '/insert', formData, {
        reportProgress: true,
        observe: 'events',
      }).pipe(timeout(this.timeout))
    ).catch((err) => {
      this._file.saveError(err);
      this._errors.saveErrors(err);
      throw err;
    });

    return object.id;
  }

  public override async update(object: IImageCategory): Promise<boolean> {
    return await this.insert(object) ? true : false;
  }
}
