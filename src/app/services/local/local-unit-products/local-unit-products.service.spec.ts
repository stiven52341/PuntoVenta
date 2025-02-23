import { TestBed } from '@angular/core/testing';

import { LocalUnitProductsService } from './local-unit-products.service';

describe('LocalUnitProductsService', () => {
  let service: LocalUnitProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalUnitProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
