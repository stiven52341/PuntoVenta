import { TestBed } from '@angular/core/testing';

import { LocalUserTypeService } from './local-user-type.service';

describe('LocalUserTypeService', () => {
  let service: LocalUserTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalUserTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
