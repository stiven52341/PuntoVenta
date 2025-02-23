import { TestBed } from '@angular/core/testing';

import { LocalInventoryCheckService } from './local-inventory-check.service';

describe('LocalInventoryCheckService', () => {
  let service: LocalInventoryCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalInventoryCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
