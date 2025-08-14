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
  constructor(private _alert: AlertsService, private _file: FilesService) { }

  public async createAlbumn(albumn: PhotoKeys) {
    if (!(await this.requestGalleryAccess())) return;
    const alb = await this.getAlbumn(albumn);
    if (alb) return alb;

    await Media.createAlbum({ name: albumn });
    return await this.getAlbumn(albumn);
  }

  public async getAlbumn(albumn: PhotoKeys) {
    if (!(await this.requestGalleryAccess())) return;
    return ((await Media.getAlbums()).albums || []).find(
      (a) => a.name == albumn
    );
  }

  public async savePhoto(name: string, data: string, albumnName: PhotoKeys) {
    if (!(await this.requestGalleryAccess())) return;
    const albumn = await this.createAlbumn(albumnName);
    await Media.savePhoto({
      path: data,
      fileName: name,
      albumIdentifier: albumn!.identifier,
    });
  }

  public async savePhotos(photos: Array<IImageProduct>, album: PhotoKeys) {
    if (!(await this.requestGalleryAccess())) return;

    try {
      await this.savePhoto(photos[0].id.toString(), photos[0].data, album);

      photos.shift();
      const pros: Array<Promise<void>> = [];
      photos.map(async (photo) => {
        pros.push(this.savePhoto(photo.id.toString(), photo.data, album));
      });
      await firstValueFrom(forkJoin(pros)).catch((err) => {
        throw err;
      });
    } catch (err) {
      this._file.saveError(err);
    }
  }

  public async getPhoto(
    name: string,
    album: PhotoKeys
  ): Promise<string | undefined> {
    try {
      if (!(await this.requestGalleryAccess())) return;

      const path = `/Android/media/${(await App.getInfo()).id
        }/${album}/${name}.png`;
      const image = await this._file.readImages(path, Directory.ExternalStorage);
      if (!image) return undefined;
      return 'data:image/png;base64,' + image.toString();
    } catch (error) {
      return undefined;
    }
  }

  public async requestGalleryAccess(): Promise<boolean> {
    if (!(await this._file.requestStoragePermission())) return false;

    const status = await Camera.checkPermissions();
    if (status.photos !== 'granted' || status.camera !== 'granted') {
      const requestResult = await Camera.requestPermissions({
        permissions: ['photos', 'camera'],
      });
      return (
        requestResult.photos === 'granted' && requestResult.camera === 'granted'
      );
    } else {
      return true;
    }
  }

  public async takePhoto(): Promise<string | undefined> {
    try {
      if (!(await this.requestGalleryAccess())) return;
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 480,
      });
      return image.base64String
        ? 'data:image/png;base64,' + image.base64String
        : undefined;
      // return image.path;
    } catch (error) {
      this._file.saveError(error);
      return undefined;
    }
  }

  public async openGallery(): Promise<string | undefined> {
    try {
      if (!(await this.requestGalleryAccess())) return;
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: 480,
      });

      return image.base64String
        ? 'data:image/png;base64,' + image.base64String
        : undefined;
      // return image.path
    } catch (error) {
      this._file.saveError(error);
      return undefined;
    }
  }

  public base64ToBlob(base64: string, contentType: string): Blob {

    const byteChars = atob(base64.replace('data:image/png;base64,', ''));
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  public base64ToFile(
    base64Data: string,
    contentType: string,
    fileName: string
  ): File {
    const blob = this.base64ToBlob(base64Data, contentType);
    return new File([blob], fileName, { type: contentType });
  }
}
