import { Injectable } from '@angular/core';
import { Criterion } from 'src/app/modules/querybuilder/model/api/query/criterion';

@Injectable({
  providedIn: 'root',
})
export class CriterionService {
  private criterionReference: Criterion[] = [];

  constructor() {}

  public setCriterion(criterions: Criterion[]): void {
    this.criterionReference = criterions;
  }

  public getCriterions(): Criterion[] {
    return this.criterionReference;
  }
}
