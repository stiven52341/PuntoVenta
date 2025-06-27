import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IImageProduct } from 'src/app/models/image-product.model';
import { ApiKeys } from 'src/app/models/constants';
import { PhotosService } from '../../photos/photos.service';
import { lastValueFrom } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImageProductService extends ApiCoreService<IImageProduct> {
  constructor(private _photo: PhotosService) {
    super(ApiKeys.IMAGE_PRODUCTS);
  }

  public override async insert(
    object: IImageProduct
  ): Promise<number | string | Object | undefined> {
    const photo = this._photo.base64ToFile(object.data, 'image/png', object.id.toString());
    const formData = new FormData();
    formData.append('id', object.id.toString());
    formData.append('file', photo);

    const result = await lastValueFrom(this._http.post<HttpEvent<any>>(this.path + '/insert', formData, {
      reportProgress: true,
      observe: 'events'
    })).catch(err => {
      this._file.saveError(err);
      this._errors.saveErrors(err);
      throw err;
    });

    return result;
  }

  public override async update(object: IImageProduct): Promise<boolean> {
    return await this.insert(object) ? true : false;
  }
}
