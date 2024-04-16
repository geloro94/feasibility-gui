import { BehaviorSubject, Observable } from 'rxjs';
import { Criterion } from '../model/FeasibilityQuery/Criterion/Criterion';
import { Injectable } from '@angular/core';
import { Query } from '../model/FeasibilityQuery/Query';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private feasibilityQuery: BehaviorSubject<Query> = new BehaviorSubject(new Query());
  private criterionMapSubject: BehaviorSubject<Map<string, Criterion[]>> = new BehaviorSubject(null);
  private criterionMapInitialized: Promise<void>;
  private criterionMap: Map<string, Criterion[]> = new Map();

  constructor() {
    this.criterionMapInitialized = new Promise<void>((resolve) => {
      this.updateCriterionMap().then(() => resolve());
    });
  }

  public async setFeasibilityQuery(feasibilityQuery: Query) {
    this.feasibilityQuery.next(feasibilityQuery);
    await this.criterionMapInitialized;
    this.updateCriterionMap();
  }

  public getFeasibilityQuery(): Observable<Query> {
    return this.feasibilityQuery.asObservable();
  }

  public getCriterionMap(): Observable<Map<string, Criterion[]>> {
    return this.criterionMapSubject.asObservable();
  }

  private async updateCriterionMap() {
    this.criterionMap.clear();

    this.feasibilityQuery.getValue().groups.forEach((group) => {
      group.inclusionCriteria.forEach((criteriaArray) => {
        criteriaArray.forEach((criteria) => {
          if (criteria.criterionHash) {
            this.addToMap(this.criterionMap, criteria.criterionHash, criteria);
          }
        });
      });
      group.exclusionCriteria.forEach((criteriaArray) => {
        criteriaArray.forEach((criteria) => {
          if (criteria.criterionHash) {
            this.addToMap(this.criterionMap, criteria.criterionHash, criteria);
          }
        });
      });
    });

    this.criterionMapSubject.next(this.criterionMap);
  }

  private addToMap(map: Map<string, Criterion[]>, key: string, value: Criterion) {
    if (map.has(key)) {
      map.get(key).push(value);
    } else {
      map.set(key, [value]);
    }
  }
}
