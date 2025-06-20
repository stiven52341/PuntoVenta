import { Injectable } from '@angular/core';
import {
  BleClient,
  BleDevice,
  ScanMode,
} from '@capacitor-community/bluetooth-le';
import { FilesService } from '../files/files.service';
import { LocalPrinterService } from '../local/local-printer/printer.service';
import { AlertsService } from '../alerts/alerts.service';
import { ESCPOS_ALIGN, Printer } from 'src/app/models/printer.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { GeneralInfoService } from '../local/general-info/general-info.service';

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  private inited: boolean = false;

  constructor(
    private _file: FilesService,
    private _printer: LocalPrinterService,
    private _alert: AlertsService,
    private _http: HttpClient,
    private _toast: ToastService,
    private _global: GeneralInfoService
  ) {
    BleClient.initialize({ androidNeverForLocation: true })
      .then(() => {
        this.inited = true;
      })
      .catch((err) => {
        this._alert.showError('Error inicializando el bluetooth');
        this.inited = false;
      });
  }

  private async check(): Promise<boolean> {
    try {
      await BleClient.requestEnable();
      if (!(await BleClient.isLocationEnabled())) {
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async scan(): Promise<BleDevice | undefined> {
    try {
      const result = await this.check();

      if (!result) return undefined;
      return await BleClient.requestDevice({ allowDuplicates: false });
    } catch (error) {
      this._file.saveError(error);
      return undefined;
    }
  }

  /**
   * Toma una imagen y la convierte a Array<Uint8Array> para ser enviado a la impresora.
   * @param imgUrl dataURL de la imagen
   * @param align Alineación de la impresión del logo
   * @param text Texto a imprimir luego de la imagen
   */
  private async renderizeLogo(
    imgUrl: string,
    align: 'left' | 'center' | 'right' = 'center',
    text?: Array<Uint8Array>
  ) {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) return;

    /**
     * Carga la imagen
     */
    const img = await this.loadImageAndConvert(imgUrl);

    /**
     * Se establece el ancho (width) y alto (height) para los calculos.
     */
    const width = img.width,
      height = img.height;
    /**
     * PROCESO DE SEPARACION EN BLOQUES (CHUNKS)
     * La impresora tiene una cantidad limitada de bits que puede recibir, por lo que se debe enviar la información en tiras/bloques/chunks.
     */
    let maxBlockHeight = 0;
    /**
     * Predefinido, a prueba y error
     */
    switch (await this.getLogoSize()) {
      case 256:
        maxBlockHeight = 4;
        break;
      case 128:
        maxBlockHeight = 8;
        break;
      case 96:
        maxBlockHeight = 12;
        break;
      case 64:
        maxBlockHeight = 16;
        break;
      default:
        maxBlockHeight = 8;
        break;
    }

    /**
     * Se utiliza el comando de GS obsoleto de GS para imprimir una imagen,
     * el comando de ESC da problemas con el interlinado en las impresoras térmicas portátiles.
     */
    //GS COMMAND: https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lv_0.html
    const base_arr = printer.getCommands().GS_IMG_START;

    //A pesar de que siempre debería ser la primera, de esta manera se asegura que sin importar el tamaño de la imagen se dejará un margen.
    const widthBytes = [
      width % 8 === 0 ? width / 8 : Math.floor(width / 8) + 1,
    ];

    //Se obtienen los pixeles
    const pixels = img.getContext('2d')!.getImageData(0, 0, width, height).data;

    /**
     * Lista de datos a imprimir
     */
    const toprint: Uint8Array[] = [];

    // Si solo se usan dos ciclos (Uno para x y otro para y) sin separa en tiras, se empieza a imprimir caracteres basura
    // porque se llena el buffer de la impresora. Por eso debe ser mediante tiras

    //Primer ciclo: Separación en tiras del tamaño del bloque. EJE Y
    for (let y = 0; y < height; y += maxBlockHeight) {
      const blockHeight = Math.min(maxBlockHeight, height - y);
      const heightBytes = [blockHeight & 0xff, (blockHeight >> 8) & 0xff];

      //Se limpia el arreglo.
      const bit_img_arr = [];

      //Segundo ciclo: Iteración dentro del bloque. SUB EJE Y
      for (let blockY = 0; blockY < blockHeight; blockY++) {
        //TERCER CICLO: Iteración en el eje X en secciones de 8 en 8
        for (let x = 0; x < width; x += 8) {
          let byte = 0;
          //Cuarto ciclo: Recorre las secciones del eje x.
          for (let bit = 0; bit < 8; bit++) {
            // 1, 2, 3, 4
            // r, g, b, a
            const index = ((y + blockY) * width + (x + bit)) * 4;
            // Sobrepasado el límite, seguir para romper el ciclo
            if (index >= pixels.length) continue;

            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            // Ignorar alpha, solo se necesitan r,g y b

            const gray = (r + g + b) / 3;
            // Recordar que la impresora térmica solo imprime en dos colores
            // Si el color es oscuro se imprime negro, de lo contrario, blanco.
            if (gray < 160) {
              // BITWISE OPERATOR OR: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR
              byte |= 1 << (7 - bit);
            }
          }
          //Agrega la información del recuadro al arreglo de la imagen.
          bit_img_arr.push(byte);
        }
      }

      // Siempre se va a centrar, dado que es en tiras
      // Cada una de las tiras se va imprimiendo.
      // El comando GS no respeta interlineado, por lo que se puede imprimir uno tras otro
      const command = new Uint8Array([
        ...ESCPOS_ALIGN(align),
        ...base_arr,
        widthBytes[0] & 0xff,
        0x00, // Multiplo de pixeles, solo para imagenes grandes (que el tamaño de una impresora portatil no llega) cambia el valor; por lo tanto es constante
        heightBytes[0],
        heightBytes[1],
        ...bit_img_arr,
      ]);

      //Agrega la info al arreglo a imprimir.
      toprint.push(command);
    }

    // Enviar los bloques de imagen a la impresora
    await this.sendImageViaBluetooth(toprint, text);
  }
  public async loadImageAndConvert(
    imagePath: string
  ): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imagePath;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        // document
        //   .getElementsByTagName('form')[0]
        //   .appendChild(this.resizeImage(canvas));
        resolve(await this.resizeImage(canvas));
      };
      img.onerror = reject;
    });
  }

  /**
   * Cambia la imagen de tamaño. Capa el tamaño según la configuración.
   * @param canvas imagen a cambiar de tamaño
   * @returns imagen con el tamaño cambiado
   */
  private async resizeImage(
    canvas: HTMLCanvasElement
  ): Promise<HTMLCanvasElement> {
    //Desde la configuracion
    const size = (await this.getLogoSize()) || 96;

    let image = new Image();
    image.src = canvas.toDataURL();
    const newCanvas = document.createElement('canvas') as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = newCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;

    newCanvas.width = (canvas.width * size) / canvas.height;
    newCanvas.height = size;

    context.getContextAttributes().willReadFrequently = true;
    context.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);

    return context.canvas;
  }

  public async getLogoBase64(
    path: string = 'company_logo.png'
  ): Promise<string | undefined> {
    
    const config = await this._global.getGeneralInfo();
    if (!config?.imprimirConLogo) return undefined;

    const fullPath = `assets/${path}`;
    const data = await firstValueFrom(
      this._http.get(fullPath, { responseType: 'blob' })
    );
    return await this.blobToDataURL(data);
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject('Error leyendo blob');
      reader.onload = () => {
        // reader.result es algo como 'data:image/png;base64,iVBORw0KGgo...'
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  // public setLogoBase64(item: string): void {
  //   this._localStorage.setItem(LocalStorageKeys.LOGO, [{
  //     data: item
  //   }]);
  // }

  public async getLogoSize() {
    //Improve to add more sizes
    return 256;
  }

  private async connect(): Promise<Printer | undefined> {
    return new Promise<Printer | undefined>(async (resolve, reject) => {
      const printer = await this._printer.getCurrentPrinter();
      if (!printer) {
        this._alert.showError('No hay una impresora configurada');
        reject(undefined)
        return undefined;
      }
      const isLocationEnabled = await BleClient.isLocationEnabled();
      if (!isLocationEnabled) {
        this._alert.showError(
          'Debe activar la localizacion para poder conectar a la impresora'
        );
        reject(undefined)
        return undefined;
      }

      const isEnabled = await BleClient.isEnabled();
      if (!isEnabled) {
        const request = await this.check();
        if (!request) {
          reject(undefined);
          return undefined;
        };
      }

      const request = await BleClient.isBonded(printer.id);
      if (!request) {
        await BleClient.createBond(printer.id, { timeout: 15000 }).catch(() => {
          reject(undefined);
          return undefined;
        });
      }

      await BleClient.connect(printer.id, async (device) => {
        await this.disconnect(device);
      })
        .then(() => {
          resolve(printer);
        })
        .catch((err) => {
          reject(err);
          return undefined;
        });
    });
  }

  public async sendDataViaBluetooth(intArray: Array<Uint8Array>) {
    const printer = await this.connect();
    console.log(printer);

    // return;
    if (!printer) {
      return;
    }

    const toast_ = await this._toast.showToast(
      'Imprimiendo...'.toUpperCase(),
      15000,
      'primary',
      'bottom'
    );
    for (const obt of intArray) {
      await this.writeData(printer, obt);
    }

    await this.disconnect(printer.id);
    toast_.dismiss();
  }

  private async writeData(
    printer: Printer,
    data: Uint8Array,
    clearBuffer: boolean = false
  ) {
    if (clearBuffer) {
      await BleClient.writeWithoutResponse(
        printer.id,
        printer.model.service,
        printer.model.characteristic,
        new DataView(new Uint8Array([...printer.getCommands().CLEAR]).buffer),
        { timeout: 15000 }
      );
    }

    await BleClient.writeWithoutResponse(
      printer.id,
      printer.model.service,
      printer.model.characteristic,
      new DataView(new Uint8Array([...printer.getCommands().INI]).buffer),
      { timeout: 15000 }
    );

    await BleClient.writeWithoutResponse(
      printer.id,
      printer.model.service,
      printer.model.characteristic,
      new DataView(new Uint8Array([...printer.getCommands().LF]).buffer),
      { timeout: 15000 }
    );

    await BleClient.writeWithoutResponse(
      printer.id,
      printer.model.service,
      printer.model.characteristic,
      new DataView(data.buffer),
      { timeout: 15000 }
    );
    await BleClient.writeWithoutResponse(
      printer.id,
      printer.model.service,
      printer.model.characteristic,
      new DataView(new Uint8Array([...printer.getCommands().CLEAR]).buffer),
      { timeout: 15000 }
    );
  }

  private async disconnect(device: string) {
    BleClient.disconnect(device);
  }

  public async sendImageViaBluetooth(
    _intArray: Array<Uint8Array> | Uint8Array = [],
    text?: Array<Uint8Array>
  ) {
    const intArray = !Array.isArray(_intArray) ? [_intArray] : _intArray || [];
    const printer = await this.connect();

    if (!printer) {
      return;
    }

    const toast_ = await this._toast.showToast(
      'Imprimiendo...'.toUpperCase(),
      15000,
      'primary',
      'bottom'
    );

    for (const obt of intArray) {
      await this._writeImageData(printer, obt);
    }

    if (text) {
      for (const obt of text) {
        await this.writeData(printer, obt, true);
      }
    }

    await this.disconnect(printer.id);
  }

  private async _writeImageData(printer: Printer, data: Uint8Array) {
    await BleClient.writeWithoutResponse(
      printer.id,
      printer.model.service,
      printer.model.characteristic,
      new DataView(data.buffer),
      { timeout: 15000 }
    );
  }

  public async print(intArray: Uint8Array[]) {
    
    const base64 = await this.getLogoBase64();
    if (base64) {
      await this.renderizeLogo(base64, 'center', intArray);
    } else {
      // Envía los datos a la impresora Bluetooth
      await this.sendDataViaBluetooth(intArray);
    }
  }

  public async getServices() {
    const printer = await this.connect();
    if (!printer) return;

    console.log(await BleClient.getServices(printer.id));
  }
}
