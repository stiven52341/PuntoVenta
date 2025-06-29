import { IEntity } from '../services/api/api-core/api-core.service';
import { States } from './constants';

export class Printer implements IEntity<String> {
  public state: boolean;
  public uploaded: States;
  constructor(public id: string, public model: IPrinterModel) {
    this.state = true;
    this.uploaded = States.NOT_SYNCABLE;
  }

  public getCommands() {
    return getCommands(this.model.ESC_COMMANDS);
  }
}

export const SUPPORTED_PRINTER_MODELS: Array<IPrinterModel> = [
  {
    name: '2C-POS58-BU',
    space: 32,
    ESC_COMMANDS: 'NORMAL',
    service: '000018f0-0000-1000-8000-00805f9b34fb',
    characteristic: '00002af1-0000-1000-8000-00805f9b34fb',
    isShort: true
  },
  {
    name: 'MPTIII58B',
    space: 32,
    ESC_COMMANDS: 'SPECIAL',
    service: '000018f0-0000-1000-8000-00805f9b34fb',
    characteristic: '00002af1-0000-1000-8000-00805f9b34fb',
    isShort: true
  },
  {
    name: 'MPTIII80B',
    space: 48,
    ESC_COMMANDS: 'SPECIAL',
    service: 'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    characteristic: 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
    isShort: false
  },
];

export interface IPrinterModel {
  name: string;
  ESC_COMMANDS: 'NORMAL' | 'SPECIAL';
  space: number;
  service: string;
  characteristic: string;
  isShort: boolean;
}

export interface ESCPOS {
  EESC: number;
  LF: Array<number>;
  CAN: Array<number>;
  INI: Array<number>;
  CLEAR: Array<number>;
  CR: Array<number>;
  BOLD_END: Array<number>;
  BOLD_START: Array<number>;
  LARGE: Array<number>;
  LARGER: Array<number>;
  NORMAL: Array<number>;
  GS_IMG_START: Array<number>;
}

export const ESCPOS_ALIGN = function (
  position: 'left' | 'center' | 'right'
): number[] {
  return [0x1b, 0x61, position === 'left' ? 0 : position === 'center' ? 1 : 2];
};

export function getCommands(type: 'NORMAL' | 'SPECIAL' = 'NORMAL'): ESCPOS {
  switch (type) {
    case 'NORMAL':
      return ESCPOS_COMMANDS.NORMAL;
    case 'SPECIAL':
      return ESCPOS_COMMANDS.SPECIAL;
    default:
      return ESCPOS_COMMANDS.NORMAL;
  }
}

export const ESCPOS_COMMANDS: { NORMAL: ESCPOS; SPECIAL: ESCPOS } = {
  NORMAL: {
    EESC: 27,
    LF: [0x0a],
    CAN: [0x27, 0x18],
    INI: [0x1b, 0x40],
    CLEAR: [0x1b, 0x40, 0x00, 0x0c],
    CR: [0x0d],
    BOLD_END: [27, 69, 0],
    BOLD_START: [27, 69, 1],
    LARGE: [27, 33, 108],
    LARGER: [27, 33, 54],
    NORMAL: [27, 33, 0],
    GS_IMG_START: [0x1d, 0x76, 0x30, 0x00],
  },
  SPECIAL: {
    EESC: 27,
    LF: [0x0a],
    CAN: [0x27, 0x18],
    INI: [],
    CLEAR: [11],
    CR: [0x0d],
    BOLD_END: [27, 69, 0],
    BOLD_START: [27, 69, 1],
    LARGE: [27, 33, 108],
    LARGER: [27, 33, 54],
    NORMAL: [27, 33, 0],
    GS_IMG_START: [0x1d, 0x76, 0x30, 0x00],
  },
};

// export const ESCCMD = {
//   EESC: 27,
//   LF: [0x0a],
//   CAN: [0x27, 0x18],
//   INI: function (impresora: IImpresora) {
//     if (
//       impresora.Tipo == ETipoImpresora.MPTIII58B ||
//       impresora.Tipo == ETipoImpresora.MPTIII80B ||
//       impresora.Tipo == ETipoImpresora.MHT_P8001
//     ) {
//       return [];
//     } else {
//       return [0x1b, 0x40];
//     }
//   },
//   CLEAR: function (impresora: IImpresora) {
//     if (
//       impresora.Tipo == ETipoImpresora.MPTIII58B ||
//       impresora.Tipo == ETipoImpresora.MPTIII80B ||
//       impresora.Tipo == ETipoImpresora.MHT_P8001
//     ) {
//       return [11];
//     } else {
//       return [0x1b, 0x40, 0x00, 0x0c];
//     }
//   },
//   NEWLINE: function (count: number): number[] {
//     return [0x1b, 0x64, count];
//   },
//   CR: [0x0d],
//   VTAB: [0x09],
//   NEGRITA_END: [27, 69, 0],
//   NEGRITA_START: [27, 69, 1],
//   FUENTE_DOBLE: [27, 33, 108],
//   FUENTE_ENORME: [27, 33, 54],
//   FUENTE_NORMAL: [27, 33, 0],
//   ALIGN: function (position: 'left' | 'center' | 'right'): number[] {
//     return [
//       0x1b,
//       0x61,
//       position === 'left' ? 0 : position === 'center' ? 1 : 2,
//     ];
//   },
//   GS_IMG_START: [0x1d, 0x76, 0x30, 0x00],
// };
