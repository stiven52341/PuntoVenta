import { TestBed } from '@angular/core/testing';

import { LocalBillInvoiceService } from './local-bill-invoice.service';

describe('LocalBillInvoiceService', () => {
  let service: LocalBillInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalBillInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
