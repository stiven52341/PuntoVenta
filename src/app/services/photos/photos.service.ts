import { Injectable } from '@angular/core';
import { Media } from '@capacitor-community/media';
import { PhotoKeys } from 'src/app/models/constants';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {
  constructor() { }

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
}
