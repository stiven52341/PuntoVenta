import { Injectable } from '@angular/core';
import { Media } from '@capacitor-community/media';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotoKeys } from 'src/app/models/constants';
import { IImageProduct } from 'src/app/models/image-product.model';
import { AlertsService } from '../alerts/alerts.service';
import { FilesService } from '../files/files.service';
import { Directory } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  constructor(private _alert: AlertsService, private _file: FilesService) {}

  public async createAlbumn(albumn: PhotoKeys) {
    const alb = await this.getAlbumn(albumn);
    if (alb) return alb;

    await Media.createAlbum({ name: albumn });
    return await this.getAlbumn(albumn);
  }

  public async getAlbumn(albumn: PhotoKeys) {
    return ((await Media.getAlbums()).albums || []).find(
      (a) => a.name == albumn
    );
  }

  public async savePhoto(name: string, data: string, albumnName: PhotoKeys) {

    const albumn = await this.createAlbumn(albumnName);
    await Media.savePhoto({
      path: data,
      fileName: name,
      albumIdentifier: albumn!.identifier,
    });
  }

  public async savePhotos(photos: Array<IImageProduct>, album: PhotoKeys) {
    if (!(await this.requestGalleryAccess())) return;
    const pros: Array<Promise<void>> = [];
    photos.forEach((photo) => {
      pros.push(this.savePhoto(photo.id.toString(), photo.image, album));
    });

    await firstValueFrom(forkJoin(pros)).catch((err) => {
      throw err;
    });
  }

  public async getPhoto(
    name: string,
    album: PhotoKeys
  ): Promise<string | undefined> {
    const path = `/Android/media/${
      (await App.getInfo()).id
    }/${album}/${name}.png`;
    const image = await this._file.read(path, Directory.ExternalStorage);
    if (!image) return undefined;
    return 'data:image/png;base64,' + image.toString();
  }

  public async requestGalleryAccess(): Promise<boolean> {
    const status = await Camera.checkPermissions();
    if (status.photos !== 'granted') {
      const requestResult = await Camera.requestPermissions({
        permissions: ['photos'],
      });
      return requestResult.photos == 'granted';
    } else {
      return true;
    }
  }

  public async takePhoto(): Promise<string | undefined>{
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      return image.base64String ? ('data:image/png;base64,' + image.base64String) : undefined;;
    } catch (error) {
      this._file.saveError(error);
      return undefined;
    }
  }

  public async openGallery(): Promise<string | undefined>{
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      return image.base64String ? ('data:image/png;base64,' + image.base64String) : undefined;
    } catch (error) {
      this._file.saveError(error);
      return undefined;
    }
  }
}
