import { Injectable } from '@angular/core';
import { ESCCMD } from 'src/app/models/constants/constants';
import { BluetoothStorageService } from '../storage/bluetooth/bluetooth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class StringToPrintService {
  private maxLength: number = 1;
  private encoder = new TextEncoder();

  /**Caracter utilizado para la identificación de cada salto de linea */
  private readonly caracterSeparacion: string = '不';

  /**Caracteres no permitidos para la impresion */
  private readonly notAllowedCharacters: Array<{ [char: string]: string }> = [
    { ñ: 'n' },
    { á: 'a' },
    { é: 'e' },
    { í: 'i' },
    { ó: 'o' },
    { ú: 'u' },
    { ä: 'a' },
    { ë: 'e' },
    { ï: 'i' },
    { ö: 'o' },
    { ü: 'u' },
    { '¥': 'y' },
    { '¡': '!' },
    { '¿': '?' },
  ];

  constructor(private _blue: BluetoothStorageService) {
    this.getLenght();
  }

  /**
   * Función que obtiene el tamaño de la impresora.
   * Es neceserio hacerlo de esta forma por si la impresora cambia
   */
  private getLenght() {
    this.maxLength = this._blue.bluetoothData.tipoImpresora.CantLineas;

    if (!this.maxLength || this.maxLength <= 0) {
      this.maxLength = 1;
    }
  }

  /**
   * Método encargado de generar una línea de texto con formato para impresión.
   * Ajusta el texto según la posición y la longitud máxima de la impresora.
   *
   * @param text - Texto a formatear.
   * @param position - Posición del texto en la línea ('start', 'middle', 'end').
   * @param size - Tamaño del texto a imprimir.
   * @returns La línea de texto formateada para impresión.
   */
  public renderLines(
    text: string,
    position: 'start' | 'middle' | 'end' = 'start',
    size: 'normal' | 'large' | 'larger' | 'bold' = 'normal'
  ): Uint8Array[] {
    this.getLenght();

    let intArray: Uint8Array[] = [];
    let str: string = '';
    let length = this.maxLength;

    //Si el tamaño es grande o muy grande, se establece la longitud a la mitad
    if (size == 'large' || size == 'larger') {
      length = Math.ceil(length / 2);
    }

    //Variables necesarias para los cálculos
    let c = 0; //Variable que almacena la cantidad de caracteres agregados a la impresión. Fundamental para controlar los ciclos
    let posI = 0; //Posición inical de impresión
    let posF = length; //Posición final de impresión
    let ultimaPalabra: number = 0; //Variable que recuerda la última palabra agregada a la linea actual de impresión.
    let saltos = 0; //Cantidad de saltos de linea realizados
    const palabras = text.trim().split(' '); //Palabras que contiene el texto, separadas por un espacio

    do {
      //Linea a imprimir
      let linea = '';

      /*
        Ciclo para determinar cuantas palabras caben en la linea.
        Comienza con la posición de la última palabra agregada.
      */
      for (let i = ultimaPalabra; i < palabras.length; i++) {
        //Si la palabra actual cabe en el espacio libre de la linea...
        if (palabras[i].length < length - linea.length) {
          //Agrega la palabra con un espacio
          linea += `${palabras[i]} `;
        } else {
          //La palabra es mas grande que el total de espacios de la linea...
          if (palabras[i].length > length) {
            //Salta a la siguiente linea. Esto está pendiente de pulir...
            continue;
          } else {
            //Si la palabra no entra en el espacio libre de la linea, guarda el espacio de la última palabra y rompe el ciclo...
            ultimaPalabra = i;
            break;
          }
        }
      }

      //Se eliminan los espacios en blanco al inicio y al final de la linea...
      linea = linea.trim();

      //Se determinan las posiciones iniciales y finales...
      switch (position) {
        case 'start':
          posI = 0;
          posF = linea.length;

          break;
        case 'middle':
          posI = Math.floor((length - linea.length) / 2);
          posF = posI + linea.length;

          break;
        case 'end':
          posI = length - linea.length;
          posF = length;

          break;
      }

      /*
        Ciclo desde 0 hasta el total de espacios de la impresora...
        Dependiendo de si la posición final es igual al total de espacios de la impresora, se suma 1 o no...
        Si no se hace se está forma, se buggea cuando la posición es `end`
      */
      for (let i = 0; i <= (posF == length ? length + 1 : length); i++) {
        //Si el índice es menor a la posición inicial, se agrega un espacio en blanco...
        if (i < posI) {
          str += ' ';
        } else if (i >= posI && i < posF) {
          //Ciclo que recorre la linea a imprimir y agrega el caracter al string de impresión
          for (let j = 0; j < linea.length; j++, i++, c++) {
            str += this.replaceCharacter(linea.charAt(j));
          }
        } else {
          //Si i está en la posición final...
          if (i == posF) {
            //Si la posición final es igual al total de espacios de la impresora...
            if (posF == length) {
              //Agrega el caracter al string
              //Esto es así porque sino cuando la posición es `end` la función se buggea...
              str += this.replaceCharacter(linea.charAt(c));
              str += this.caracterSeparacion;
              saltos++;
              c++;
            } else {
              //Se agrega un espacio en blanco...
              str += this.caracterSeparacion;
              saltos++;
            }
          } else {
            //Si i no es igual a la posición final...
            //Si i es menor al final de la fila...
            if (i < length - 1) {
              //Se agrega un espacio en blanco...
              str += ' ';
            } else if (i >= length - 1) {
              //Si i es mayor o igual al final de la linea...
              //Si la posición final es igual al tamaño de la linea, se agrega el caracter de salto de linea,
              //Si no, se agrega un doble espacio en blanco con el caracter de separación (de nuevo, si no es así, se buggea con la posición `end`)
              str +=
                posF == length
                  ? this.caracterSeparacion
                  : '  ' + this.caracterSeparacion;
              saltos++;
              break;
            }
          }
        }
      }
    } while (c < text.trim().length - saltos); //Mientras c sea menor al tamaño del texto original menos a la cantidad de saltos de linea...

    str = str.toUpperCase();
    let arrayStr = str.split(this.caracterSeparacion); //Arreglo de contiene cada una de las lineas para imprimir

    //Se verifica por cada linea si el tamaño es mayor al permitido...
    arrayStr.forEach((_str, index) => {
      let newStr = '';
      for (let i = 0; i < _str.length; i++) {
        if (_str.length > length) {
          if (i == _str.length - 1) {
            if (_str.charAt(i) != ' ') {
              newStr += _str.charAt(i);
            }
          } else {
            newStr += _str.charAt(i);
          }
        } else {
          newStr += _str.charAt(i);
        }
      }
      arrayStr[index] = newStr;
    });

    arrayStr.forEach((_str) => {
      //Si el tamaño de la linea es mayor a 0
      if (_str.length > 0) {
        switch (size) {
          case 'bold':
            intArray.push(
              new Uint8Array([
                ...ESCCMD.NEGRITA_START,
                ...this.encoder.encode(_str),
                ...ESCCMD.NEGRITA_END,
              ])
            );
            break;
          case 'large':
            intArray.push(
              new Uint8Array([
                ...ESCCMD.FUENTE_DOBLE,
                ...this.encoder.encode(_str),
              ])
            );
            break;
          case 'larger':
            intArray.push(
              new Uint8Array([
                ...ESCCMD.FUENTE_ENORME,
                ...this.encoder.encode(_str),
              ])
            );
            break;
          default:
            intArray.push(
              new Uint8Array([
                ...ESCCMD.FUENTE_NORMAL,
                ...this.encoder.encode(_str),
              ])
            );
            break;
        }
      }
    });

    return intArray;
  }

  /**
   * Método encargado de reemplazar caracteres no permitidos por otros válidos para impresión.
   *
   * @param char - Caracter a reemplazar.
   * @returns El caracter reemplazado si es necesario, de lo contrario, devuelve el caracter original.
   */
  private replaceCharacter(char: string): string {
    this.getLenght();

    // Convertimos el caracter a minúsculas para compararlo con los caracteres no permitidos
    char = char.toLowerCase();
    let newChar: string = '';

    let index = -1;

    // Recorremos el arreglo de caracteres no permitidos
    this.notAllowedCharacters.forEach((c) => {
      // Si el caracter se encuentra en el arreglo, lo reemplazamos
      if (c[char]) {
        newChar = c[char];
        index = this.notAllowedCharacters.indexOf(c);
      }
    });

    // Si se encontró un caracter no permitido, se devuelve el reemplazo
    if (index > -1) {
      return newChar;
    } else {
      // Si no se encontró un caracter no permitido, devolvemos el caracter original
      return char;
    }
  }

  /**
   * Función para imprimir solo una linea con llena con uno caracter.
   * IMPORTANTE: Funciona solo con una caracter
   * @param char
   * @param size
   * @returns `Uint8Array`
   */
  public renderCharacterLine(
    char: string = ' ',
    size: 'normal' | 'bold' | 'large' | 'larger' = 'normal'
  ): Uint8Array {
    this.getLenght();

    let str = '';
    let intArray = new Uint8Array();

    let length = this.maxLength;

    if (size == 'large' || size == 'larger') {
      length = this.maxLength / 2;
    }

    for (let i = 0; i <= length - 1; i++) {
      str += char;
    }

    switch (size) {
      case 'normal':
        intArray = new Uint8Array([
          ...ESCCMD.FUENTE_NORMAL,
          ...this.encoder.encode(str),
        ]);
        break;
      case 'bold':
        intArray = new Uint8Array([
          ...ESCCMD.NEGRITA_END,
          ...this.encoder.encode(str),
        ]);
        break;
      case 'large':
        intArray = new Uint8Array([
          ...ESCCMD.FUENTE_DOBLE,
          ...this.encoder.encode(str),
        ]);
        break;
      case 'larger':
        intArray = new Uint8Array([
          ...ESCCMD.FUENTE_ENORME,
          ...this.encoder.encode(str),
        ]);
        break;
      default:
        intArray = new Uint8Array([
          ...ESCCMD.FUENTE_NORMAL,
          ...this.encoder.encode(str),
        ]);
        break;
    }

    return intArray;
  }

  /**
   * Función para imprimir una fila
   * @param columns Columnas. Solo se permiten 4 columnas en total. Las últimas 2 son opcionales
   * @param color
   * @param position Se permiten 4 posiciones. `start`,`center`,`end`,`space-between`(la primera fila, `start`;la segunda y tercera, `center`; y la última, `end`)
   * @returns `Array<Uint8Array>`
   */
  public renderRow(
    columns: [
      column1: string,
      column2: string,
      column3?: string,
      column4?: string
    ],
    color: 'normal' | 'bold' = 'normal',
    position: 'start' | 'center' | 'end' | 'space-between' = 'center'
  ): Array<Uint8Array> {
    this.getLenght();

    let intArray: Array<Uint8Array> = [];
    let str: string = '';

    //Se determina el espacio dedicado para cada columna
    let columnWidth = Math.ceil(this.maxLength / columns.length);

    /**
     * Objeto utilizado para almacenar la información los datos de cada una de las columnas donde el texto no cabe en una sola fila.
     * Almacena las posiciones y el número de columnas, y con `finished` si ya se ha escrito todo el texto que va en esa columna
     */
    let tempData: Array<{ start: number; column: number; finished: boolean }> =
      [];
    let c = 0; //Variable que almacena la cantidad de caracteres escritos. Fundamental para controlar los ciclos
    let salto = 0;

    /** Arreglo que ayuda a controlar los ciclos */
    let completedColumns = [false, false, false, false];

    do {
      let strColumn = '';
      for (let i = 0; i < columns.length; i++) {
        strColumn = ''; //Almacena el texto que debe tener la columna

        //Variables que controlan las posiciones...
        let posI = 0;
        let posF = 0;

        //Si hay texto pendiente por escribir en la columna...
        if (tempData[i] && !tempData[i].finished) {
          //Se sigue escribiendo desde la ultima posicion escrita en la fila anterior según la columna
          c = tempData[i].start;
        } else {
          c = 0;
        }

        //Se determinan las posiciones...
        switch (position) {
          case 'start':
            if (columns[i]) {
              posI = 0;
              posF = columns[i]!.length;
              if (posF < 0 || posF > columnWidth) posF = columnWidth;
            }
            break;
          case 'center':
            if (columns[i]) {
              posI = Math.floor((columnWidth - (columns[i]!.length - c)) / 2);
              posF = Math.floor(posI + (columns[i]!.length - c));
              if (posF > columnWidth) posF = columnWidth;
            }
            break;
          case 'end':
            if (columns[i]) {
              posI = columnWidth - (columns[i]!.length - c + 1);
              posF = columnWidth;

              if (posI < 0) posI = 0;
              if (posF > columnWidth) posF = columnWidth;
            }
            break;
          case 'space-between':
            switch (i) {
              case 0:
                if (columns[i]) {
                  posI = 0;
                  posF = columns[i]!.length;
                  if (posF < 0 || posF > columnWidth) posF = columnWidth;
                }
                break;
              case 1:
                if (columns.length == 3 || columns.length == 4) {
                  posI = Math.floor(
                    (columnWidth - (columns[i]!.length - c)) / 2
                  );
                  posF = Math.floor(posI + (columns[i]!.length - c));
                  if (posF > columnWidth) posF = columnWidth;
                } else {
                  posI = columnWidth - (columns[i]!.length - c + 1);
                  posF = columnWidth;
                  if (posI < 0) posI = 0;
                  if (posF > columnWidth) posF = columnWidth;
                }

                break;
              case 2:
                if (columns.length == 3) {
                  posI = columnWidth - (columns[i]!.length - c + 1);
                  posF = columnWidth;
                  if (posI < 0) posI = 0;
                  if (posF > columnWidth) posF = columnWidth;
                } else {
                  posI = Math.floor(
                    (columnWidth - (columns[i]!.length - c)) / 2
                  );
                  posF = Math.floor(posI + (columns[i]!.length - c));
                  if (posF > columnWidth) posF = columnWidth;
                }
                break;
              case 3:
                if (columns.length == 4) {
                  posI = columnWidth - (columns[i]!.length - c + 1);
                  posF = columnWidth;
                  if (posI < 0) posI = 0;
                  if (posF > columnWidth) posF = columnWidth;
                } else {
                  posI = Math.floor(
                    (columnWidth - (columns[i]!.length - c)) / 2
                  );
                  posF = Math.floor(posI + (columns[i]!.length - c));
                  if (posF > columnWidth) posF = columnWidth;
                }
            }
            break;
        }

        //Ciclo desde 0 hasta el tamaño de la columna
        for (let j = 0; j <= columnWidth; j++) {
          //Si hay texto pendiente, toma c, sino, toma lo que se ha escrito en la columna - 1.
          //Mientras lo anterior sea menor que el tamaño de la columna y aún no se ha escrito todo en la columna.
          if (
            (tempData[i] ? c : strColumn.trim().length - 1) <
              columns[i]!.length &&
            !completedColumns[i]
          ) {
            //Si j es menor al tamaño de la columna - 1
            if (j < columnWidth - 1) {
              //Si j es menor que la posición inicial
              if (j < posI) {
                //Agrega espacios en blanco
                strColumn += ' ';
              } else if (j >= posI && j < posF) {
                //Si j es mayor o igual a la posición inicial y es menor que la final

                //Si ya se escribió todo y se llegó al final del espacio de la fila para la columna...
                if (tempData[i] && c >= columns[i]!.length) {
                  //Se agrega un espacio en blanco a modo de "gap"
                  strColumn += ' ';
                  completedColumns[i] = true; //Se determina que ya se escribió todo lo que se debería en la columna
                } else {
                  //Si aún no se ha escrito todo y se llegó al final de la fila para la columna...
                  //Se escribe parte de lo que falta
                  strColumn += columns[i]?.charAt(j - strColumn.length + c);
                  c++;
                }
              } else {
                //Se agrega un espacio en blanco a modo de "gap"
                strColumn += ' ';
              }
            } else if (j == columnWidth - 1) {
              //Se agrega un espacio en blanco a modo de "gap"
              strColumn += ' ';
            } else {
              //Si se llegó al final del espacio de la fila para la columna, se busca en el arreglo de data temporal
              const index = tempData.findIndex((t) => t.column == i);

              if (index == -1) {
                //Se guardan los datos restantes...
                tempData.push({ start: c, column: i, finished: false });
              } else {
                //Se modifican los datos para poder continuar con el texto restante
                tempData[index] = { start: c, column: i, finished: false };

                if (columns[i]) {
                  //Si ya se escribio toda la información en la columna...
                  if (tempData[index].start >= columns[index]!.length)
                    tempData[index].finished = true;
                }
              }
              break;
            }
          } else {
            //Si j menor que el tamaño de la columna
            if (j < columnWidth) {
              //Si hay datos pendientes
              if (columns[i] && tempData[i]) {
                //Si ya se escribio toda la información
                if (tempData[i].start >= columns[i]!.length) {
                  completedColumns[i] = true;
                  tempData[i].finished = true;
                }
              } else {
                completedColumns[i] = true;
              }
              strColumn += ' ';
            } else {
              completedColumns[i] = true;
              if (tempData[i]) {
                tempData[i].finished = true;
              }
              break;
            }
          }
        }
        str += strColumn;
      }

      //Se agregan los saltos de linea...
      if (tempData.length > 0) {
        for (let z = 0; z < tempData.length; z++) {
          if (tempData[z]) {
            if (!tempData[z].finished) {
              str += this.caracterSeparacion;
              salto++;
              break;
            } else {
              tempData[z].finished = true;
            }
          }
        }
      }
    } while (tempData.length > 0 && tempData.some((t) => !t.finished));

    // Esto es para quitar un espacio en blanco en caso de que la columna se sature...
    str = str.toUpperCase();
    const lines = str.split(this.caracterSeparacion);

    //Se comprueba que las lineas no superen el tamaño permitido
    lines.forEach((line, index) => {
      if (line.length > this.maxLength) {
        if (lines[index][0] == ' ') {
          lines[index] = line.slice(1);
        } else if (lines[index][line.length - 1] == ' ') {
          lines[index] = line.slice(0, -1);
        }
      }
    });

    //Proceso normal para construir el array para imprimir...
    lines.forEach((line) => {
      if (line.trim().replace(/\s+/g, '') != '') {
        switch (color) {
          case 'normal':
            intArray.push(
              new Uint8Array([
                ...ESCCMD.FUENTE_NORMAL,
                ...this.encoder.encode(line),
              ])
            );
            break;
          case 'bold':
            intArray.push(
              new Uint8Array([
                ...ESCCMD.NEGRITA_START,
                ...this.encoder.encode(line),
                ...ESCCMD.NEGRITA_END,
              ])
            );
            break;
          default:
            intArray.push(
              new Uint8Array([
                ...ESCCMD.FUENTE_NORMAL,
                ...this.encoder.encode(line),
              ])
            );
            break;
        }
      }
    });
    return intArray;
  }
}
