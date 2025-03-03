import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ToastService } from '../toast/toast.service';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private _toast: ToastService) { }

  public async write(data: string, fileName: string, directory: Directory = Directory.Data){
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8
      });
    } catch (error) {
      throw new Error(`Error while writing file: ${error}`);
    }
  }

  public async read(fileName: string, directory: Directory = Directory.Data, encoding: Encoding = Encoding.UTF8){
    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: directory,
        // encoding: Encoding.UTF8
      });

      return result.data;
    } catch (error) {
      // if(String(error).toLocaleLowerCase().trim().includes('file does not exist')){
        // return undefined;
      // }

      // throw new Error(`Error reading file: ${error}`);
      return undefined;
    }
  }

  public async saveError(error: any){
    const info = await App.getInfo();
    this._toast.showToast(`Errores guardados en android/data/${info.id}/files/errors.txt`);
    let data = await this.read('errors.txt') || '';
    data = `${data}\n***\n${error}`;
    await this.write(data,'errors.txt');
  }
}
