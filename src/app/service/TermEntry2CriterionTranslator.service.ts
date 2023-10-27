import { Injectable } from '@angular/core';
import { TerminologyEntry } from '../modules/querybuilder/model/api/terminology/terminology';
import { Criterion } from '../modules/querybuilder/model/api/query/criterion';

@Injectable({
  providedIn: 'root',
})
export class TermEntry2CriterionTranslatorService {
  private useFeatureTimeRestrictions = false;
  constructor(useFeatureTimeRestrictions = false) {
    this.useFeatureTimeRestrictions = useFeatureTimeRestrictions;
  }
}
