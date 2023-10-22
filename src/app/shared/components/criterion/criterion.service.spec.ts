import { TestBed } from '@angular/core/testing';

import { CriterionService } from './criterion.service';

describe('CriterionService', () => {
  let service: CriterionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CriterionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
