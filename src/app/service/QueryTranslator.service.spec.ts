import { TestBed } from '@angular/core/testing';

import { QueryTranslatorService } from './QueryTranslator.service';

describe('QueryTranslatorService', () => {
  let service: QueryTranslatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryTranslatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
