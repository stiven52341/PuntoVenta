import { TestBed } from '@angular/core/testing';

import { LocalModulesService } from './local-modules.service';

describe('LocalModulesService', () => {
  let service: LocalModulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalModulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
