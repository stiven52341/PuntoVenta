import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ToastService } from '../toast/toast.service';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(private _toast: ToastService) {}

  public async write(
    data: string,
    fileName: string,
    directory: Directory = Directory.Data
  ) {
    try {
      if (!(await this.requestStoragePermission())) return;
      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      throw new Error(`Error while writing file: ${error}`);
    }
  }

  public async read(fileName: string, directory: Directory = Directory.Data) {
    try {
      if (!(await this.requestStoragePermission())) return;
      const result = await Filesystem.readFile({
        path: fileName,
        directory: directory,
        // encoding: Encoding.UTF8
      });

      return result.data;
    } catch (error) {
      if (
        String(error).toLocaleLowerCase().trim().includes('file does not exist')
      ) {
        await this.write('', 'errors.txt');
      }

      // throw new Error(`Error reading file: ${error}`);
      return undefined;
    }
  }

  public async saveError(error: any, showToast: boolean = true) {
    if (!(await this.requestStoragePermission())) return;

    const info = await App.getInfo();
    if (showToast)
      this._toast.showToast(
        `Errores guardados en android/data/${info.id}/files/errors.txt`,
        3000,
        'danger'
      );
    let data = (await this.read('errors.txt')) || '';
    data = `${data}\n***\n${error}`;
    await this.write(data, 'errors.txt');
  }

  public async requestStoragePermission(): Promise<boolean> {
    const status = await Filesystem.checkPermissions();
    if (status.publicStorage == 'granted') return true;

    const result = await Filesystem.requestPermissions();
    return result.publicStorage == 'granted';
  }
}
