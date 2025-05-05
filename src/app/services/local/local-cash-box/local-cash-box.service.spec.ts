import { TestBed } from '@angular/core/testing';

import { LocalCashBoxService } from './local-cash-box.service';

describe('LocalCashBoxService', () => {
  let service: LocalCashBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalCashBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
