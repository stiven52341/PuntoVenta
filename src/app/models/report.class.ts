import { StringToPrintService } from '../services/string-to-print/string-to-print.service';

export class Report {
  private intArray: Array<Uint8Array>;

  constructor(
    private _stp: StringToPrintService,
  ) {
    this.intArray = [];
  }

  public addHeader() {
    // this.intArray.push(...this._stp.renderLines('Natura', 'middle', 'large'));
    // this.intArray.push(...this._stp.renderLines('Frutas & Vegetales'));
    // this.intArray.push(
    //   ...this._stp.renderLines('Av. 27 de Febrero, Santiago')
    // );
    this.fillLine();
  }

  public addFooter() {}

  public addLines(
    lines: string,
    position: 'start' | 'middle' | 'end' = 'start',
    size: 'normal' | 'large' | 'larger' | 'bold' = 'normal'
  ) {
    this.intArray.push(...this._stp.renderLines(lines, position, size));
  }

  public fillLine(
    character: string = ' ',
    lines: number = 1,
    size: 'normal' | 'bold' | 'large' | 'larger' = 'normal'
  ) {
    for (let i = 0; i < lines; i++) {
      this.intArray.push(this._stp.renderCharacterLine(character, size));
    }
  }

  public addRow(
    columns: [
      column1: string,
      column2: string,
      column3?: string,
      column4?: string
    ],
    color: "normal" | "bold" = 'normal',
    position: "start" | "center" | "end" | "space-between" = 'start'
  ) {
    this.intArray.push(...this._stp.renderRow(columns, color, position));
  }

  public getIntArray() {
    return this.intArray;
  }
}
