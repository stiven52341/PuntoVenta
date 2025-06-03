import { StringToPrintService } from '../services/string-to-print/string-to-print.service';

export class Report {
  private intArray: Array<Uint8Array>;

  constructor(private _stp: StringToPrintService) {
    this.intArray = [];
  }

  public addHeader() {}

  public addFooter() {}

  public addLines(lines: string) {}

  public fillLine(character: string, lines: number) {}

  public addRow(
    columns: [
      column1: string,
      column2: string,
      column3?: string,
      column4?: string
    ]
  ) {}

  public getIntArray() {
    return this.intArray;
  }
}
