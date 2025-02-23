import { TestBed } from '@angular/core/testing';

import { LocalUnitsService } from './local-units.service';

describe('LocalUnitsService', () => {
  let service: LocalUnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalUnitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
