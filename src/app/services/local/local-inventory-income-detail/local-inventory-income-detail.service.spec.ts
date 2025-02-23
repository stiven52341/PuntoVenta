import { TestBed } from '@angular/core/testing';

import { LocalInventoryIncomeDetailService } from './local-inventory-income-detail.service';

describe('LocalInventoryIncomeDetailService', () => {
  let service: LocalInventoryIncomeDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalInventoryIncomeDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
