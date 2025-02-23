import { TestBed } from '@angular/core/testing';

import { LocalCategoriesService } from './local-categories.service';

describe('LocalCategoriesService', () => {
  let service: LocalCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
