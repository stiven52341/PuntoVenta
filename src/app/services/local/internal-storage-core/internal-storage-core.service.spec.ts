import { TestBed } from '@angular/core/testing';

import { InternalStorageCoreService } from './internal-storage-core.service';

describe('InternalStorageCoreService', () => {
  let service: InternalStorageCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalStorageCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
