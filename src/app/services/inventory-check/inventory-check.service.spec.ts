import { TestBed } from '@angular/core/testing';

import { InventoryCheckService } from './inventory-check.service';

describe('InventoryCheckService', () => {
  let service: InventoryCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
