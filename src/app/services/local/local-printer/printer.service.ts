import { Injectable } from '@angular/core';
import { InternalStorageCoreService } from '../internal-storage-core/internal-storage-core.service';
import { StorageKeys } from 'src/app/services/constants';
import { Printer } from 'src/app/models/printer.model';

@Injectable({
  providedIn: 'root'
})
export class LocalPrinterService extends InternalStorageCoreService<Printer>{

  constructor() {
    super(StorageKeys.PRINTER);
  }

  public override async insert(obj: Printer){
    const olds = await this.getAll();

    if(olds.length >= 1){
      throw new Error('Only one printer allowed at same time');
    }

    olds.push(obj);
    await this.set(olds);
  }

  public async getCurrentPrinter(): Promise<Printer | undefined>{
    const printers = await this.getAll();
    if(printers.length == 0) return undefined;
    const info = printers[0];
    return new Printer(info.id, info.model);
  }
}
