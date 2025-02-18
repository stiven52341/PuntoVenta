import { TestBed } from '@angular/core/testing';

import { InventoryIncomeDetailService } from './inventory-income-detail.service';

describe('InventoryIncomeDetailService', () => {
  let service: InventoryIncomeDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryIncomeDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
