import { TestBed } from '@angular/core/testing';

import { LocalPurchaseService } from './local-purchase.service';

describe('LocalPurchaseService', () => {
  let service: LocalPurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalPurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
