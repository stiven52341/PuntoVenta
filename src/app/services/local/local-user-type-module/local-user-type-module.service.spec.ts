import { TestBed } from '@angular/core/testing';

import { LocalUserTypeModuleService } from './local-user-type-module.service';

describe('LocalUserTypeModuleService', () => {
  let service: LocalUserTypeModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalUserTypeModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
