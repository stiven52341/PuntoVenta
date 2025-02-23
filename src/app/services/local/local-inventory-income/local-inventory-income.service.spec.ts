import { TestBed } from '@angular/core/testing';

import { LocalInventoryIncomeService } from './local-inventory-income.service';

describe('LocalInventoryIncomeService', () => {
  let service: LocalInventoryIncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalInventoryIncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
