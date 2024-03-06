import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Query } from '../model/FeasibilityQuery/Query';

@Injectable({
  providedIn: 'root',
})
/**
 * Singleton service, only one instance of this service exists
 *  */
export class QueryService {
  private static instance: QueryService;
  private feasibilityQuery: BehaviorSubject<Query> = new BehaviorSubject(new Query());

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * Access the data synchronously from the singleton
   *
   * @returns QueryService
   */
  static getInstance(): QueryService {
    if (!QueryService.instance) {
      QueryService.instance = new QueryService();
    }
    return QueryService.instance;
  }

  public setFeasibilityQuery(feasibilityQuery: Query) {
    this.feasibilityQuery.next(feasibilityQuery);
  }

  /**
   * Accessing the data asynchronously --> You need to subscribe
   *
   * @returns Observable<Query>
   */
  public getFeasibilityQuery(): Observable<Query> {
    return this.feasibilityQuery.asObservable();
  }
}
