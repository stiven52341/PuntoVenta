import { TestBed } from '@angular/core/testing';

import { LocalPurchaseDetailService } from './local-purchase-detail.service';

describe('LocalPurchaseDetailService', () => {
  let service: LocalPurchaseDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalPurchaseDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
