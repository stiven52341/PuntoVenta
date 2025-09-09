import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ToastService } from '../toast/toast.service';
import { App } from '@capacitor/app';
import { DirectoryKeys, FilesKeys } from 'src/app/services/constants';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(private _toast: ToastService) { }

  public async write(
    data: string, fileName: FilesKeys, directory: Directory = Directory.Documents
  ): Promise<string | undefined> {
    try {
      if (!(await this.requestStoragePermission())) return undefined;

      // if (!(await this.checkDirectory(DirectoryKeys.ROOT))) {
      //   await Filesystem.mkdir({
      //     path: DirectoryKeys.ROOT,
      //     directory: directory,
      //     recursive: true,
      //   });
      // }

      const result = await Filesystem.writeFile({
        path: `${DirectoryKeys.ROOT}/${fileName}`,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8,
        recursive: true
      });
      return result.uri;
    } catch (error) {
      throw new Error(`Error while writing file: ${error}`);
    }
  }

  public async read(fileName: FilesKeys) {
    try {
      if (!(await this.requestStoragePermission())) return;
      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        // encoding: Encoding.UTF8
      });

      return result.data;
    } catch (error) {
      if (
        String(error).toLocaleLowerCase().trim().includes('file does not exist')
      ) {
        await this.write('', FilesKeys.ERRORS);
      }

      // throw new Error(`Error reading file: ${error}`);
      return undefined;
    }
  }

  public async saveError(error: unknown, showToast: boolean = true) {
    if (!(await this.requestStoragePermission())) return;

    const info = await App.getInfo();
    if (showToast)
      this._toast.showToast(
        `Errores guardados en android/data/${info.id}/files/errors.txt`,
        3000,
        'danger'
      );
    let data = (await this.read(FilesKeys.ERRORS)) || '';
    data = `${data}\n***\n${JSON.stringify(error)}`;
    await this.write(data, FilesKeys.ERRORS);
  }

  public async requestStoragePermission(): Promise<boolean> {
    const status = await Filesystem.checkPermissions();
    if (status.publicStorage == 'granted') return true;

    const result = await Filesystem.requestPermissions();
    return result.publicStorage == 'granted';
  }

  private async checkDirectory(dir: DirectoryKeys) {
    try {
      await Filesystem.readdir({
        path: dir,
        directory: Directory.Cache, // o Directory.Data, Documents, External, etc.
      });
      return true;
    } catch (error) {
      return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        (error as any).message.includes('File does not exist')
      );
    }
  }

  public async readImages(fileName: string, directory: Directory) {
    try {
      if (!(await this.requestStoragePermission())) return;
      const result = await Filesystem.readFile({
        path: fileName,
        directory: directory,
        // encoding: Encoding.UTF8
      }).catch(err => {
        throw err;
      });

      return result.data;
    } catch (error) {
      if (
        String(error).toLocaleLowerCase().trim().includes('does not exist')
      ) {
        await this.write('', FilesKeys.ERRORS);
      }

      // throw new Error(`Error reading file: ${error}`);
      return undefined;
    }
  }

  public async saveTempData(filename: FilesKeys, data: string) {
    return await this.write(data, filename, Directory.Cache);
  }

  public async deleteTempData(){
    await Filesystem.rmdir({
      path: DirectoryKeys.TEMP_DIR,
      directory: Directory.Cache,
      recursive: true
    });
  }
}
