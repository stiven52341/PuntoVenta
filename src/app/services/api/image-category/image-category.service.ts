import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IImageCategory } from 'src/app/models/image-category.model';
import { ApiKeys } from 'src/app/models/constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageCategoryService extends ApiCoreService<IImageCategory> {
  constructor() {
    super(ApiKeys.IMAGE_CATEGORIES);
  }

  public override async insert(
    object: IImageCategory
  ): Promise<number | string | Object | undefined> {
    if (object.image.includes('data:image/png;base64,')) {
      object.image = object.image.replace('data:image/png;base64,', '');
    }

    const result = await firstValueFrom(
      this._http.post(`${this.path}/insert`, object)
    ).catch((err) => {
      console.log(`Error while inserting: ${JSON.stringify(err)}`);
      this._file.saveError(err);
    });

    if (!result) return undefined;

    return result;
  }
}
