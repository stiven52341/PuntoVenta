import { TestBed } from '@angular/core/testing';

import { LocalCurrenciesService } from './local-currencies.service';

describe('LocalCurrenciesService', () => {
  let service: LocalCurrenciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalCurrenciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
