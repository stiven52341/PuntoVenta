import { TestBed } from '@angular/core/testing';

import { LocalProductsService } from './local-products.service';

describe('LocalProductsService', () => {
  let service: LocalProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
