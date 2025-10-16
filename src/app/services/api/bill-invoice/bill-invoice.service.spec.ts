import { TestBed } from '@angular/core/testing';

import { BillInvoiceService } from './bill-invoice.service';

describe('BillInvoiceService', () => {
  let service: BillInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
