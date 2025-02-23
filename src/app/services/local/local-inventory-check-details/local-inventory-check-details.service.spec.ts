import { TestBed } from '@angular/core/testing';

import { LocalInventoryCheckDetailsService } from './local-inventory-check-details.service';

describe('LocalInventoryCheckDetailsService', () => {
  let service: LocalInventoryCheckDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalInventoryCheckDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
