import { Injectable } from '@angular/core';
import { Media } from '@capacitor-community/media';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotoKeys } from 'src/app/models/constants';
import { IImageProduct } from 'src/app/models/image-product.model';
import { AlertsService } from '../alerts/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {
  constructor(private _alert: AlertsService ) { }

  public async createAlbumn(albumn: PhotoKeys){
    const alb = await this.getAlbumn(albumn);
    if(alb) return alb;

    await Media.createAlbum({name: albumn});
    return await this.getAlbumn(albumn);
  }

  public async getAlbumn(albumn: PhotoKeys){
    return ((await Media.getAlbums()).albums || []).find(
      a => a.name == albumn
    );
  }

  public async savePhoto(name: string,data: string, albumnName: PhotoKeys){
    const albumn = await this.createAlbumn(albumnName);
    await Media.savePhoto({
      path: data,
      fileName: name,
      albumIdentifier: albumn!.identifier
    });
  }

  public async savePhotos(photos: Array<IImageProduct>, album: PhotoKeys){
    const pros: Array<Promise<void>> = [];
    photos.forEach(photo => {
      pros.push(
        this.savePhoto(photo.id.toString(), photo.image, album)
      );
    });

    await firstValueFrom(forkJoin(pros)).catch(
      err => {
        throw err;
      }
    );
  }

  // public async getPhoto(name: string, album: PhotoKeys): Promise<string>{

  // }
}
