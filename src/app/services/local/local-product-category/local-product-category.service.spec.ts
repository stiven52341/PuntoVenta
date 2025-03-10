import { TestBed } from '@angular/core/testing';

import { LocalProductCategoryService } from './local-product-category.service';

describe('LocalProductCategoryService', () => {
  let service: LocalProductCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalProductCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
