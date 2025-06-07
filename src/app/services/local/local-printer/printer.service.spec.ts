import { TestBed } from '@angular/core/testing';

import { LocalPrinterService } from './printer.service';

describe('PrinterService', () => {
  let service: LocalPrinterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalPrinterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
