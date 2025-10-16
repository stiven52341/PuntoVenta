import { TestBed } from '@angular/core/testing';

import { LocalBillsService } from './bills.service';

describe('BillsService', () => {
  let service: LocalBillsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalBillsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
