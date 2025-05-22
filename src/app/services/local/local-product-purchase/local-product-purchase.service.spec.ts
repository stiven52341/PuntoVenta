import { TestBed } from '@angular/core/testing';

import { LocalProductPurchaseService } from './local-product-purchase.service';

describe('LocalProductPurchaseService', () => {
  let service: LocalProductPurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalProductPurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
