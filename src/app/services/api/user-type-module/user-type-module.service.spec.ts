import { TestBed } from '@angular/core/testing';

import { UserTypeModuleService } from './user-type-module.service';

describe('UserTypeModuleService', () => {
  let service: UserTypeModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTypeModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
