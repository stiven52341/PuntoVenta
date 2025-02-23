import { TestBed } from '@angular/core/testing';

import { InventoryCheckDetailService } from './inventory-check-detail.service';

describe('InventoryCheckDetailService', () => {
  let service: InventoryCheckDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryCheckDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
