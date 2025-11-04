import { TestBed } from '@angular/core/testing';

import { LocalEmployeeService } from './local-employee.service';

describe('LocalEmployeeService', () => {
  let service: LocalEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
