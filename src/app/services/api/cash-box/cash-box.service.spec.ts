import { TestBed } from '@angular/core/testing';

import { CashBoxService } from './cash-box.service';

describe('CashBoxService', () => {
  let service: CashBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
