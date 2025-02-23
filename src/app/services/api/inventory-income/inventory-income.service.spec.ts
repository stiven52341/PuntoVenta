import { TestBed } from '@angular/core/testing';

import { InventoryIncomeService } from './inventory-income.service';

describe('InventoryIncomeService', () => {
  let service: InventoryIncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryIncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
