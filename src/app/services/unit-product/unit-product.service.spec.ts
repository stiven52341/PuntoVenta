import { TestBed } from '@angular/core/testing';

import { UnitProductService } from './unit-product.service';

describe('UnitProductService', () => {
  let service: UnitProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
