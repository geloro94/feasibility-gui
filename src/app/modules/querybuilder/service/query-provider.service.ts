/* eslint-disable @typescript-eslint/member-ordering */
import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { environment } from '../../../../environments/environment';
import { GroupFactory } from '../controller/GroupFactory';
import { QueryResult } from 'src/app/model/result/QueryResult';
import { Comparator } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/AbstractAttributeFilters';
import { Query } from 'src/app/model/FeasibilityQuery/Query';
import { FilterTypes } from 'src/app/model/FilterTypes';
@Injectable({
  providedIn: 'root',
})
export class QueryProviderService {
  STORAGE_QUERY_KEY = 'QUERY';
  SAVE_QUERY_KEY = 'SAVEDQUERIES';
  latestQueryId: string;

  constructor(@Inject(LOCAL_STORAGE) public storage: StorageService) {}

  public query(): Query {
    const query = this.storage.get(this.STORAGE_QUERY_KEY);
    return query && environment.name !== 'test' ? query : QueryProviderService.createDefaultQuery();
  }

  public store(query: Query): void {
    this.storage.set(this.STORAGE_QUERY_KEY, query);
  }

  public storeQueryResult(queryResult: QueryResult): void {
    this.latestQueryId = queryResult.queryId;
    this.storage.set(queryResult.queryId, queryResult);
  }

  public getQueryResult(): QueryResult {
    return this.storage.get(this.latestQueryId);
  }

  public saveQueries(queries: Array<any>): void {
    this.storage.set(this.SAVE_QUERY_KEY, queries);
  }
  public loadQueries(): Array<any> {
    return this.storage.get(this.SAVE_QUERY_KEY);
  }

  public static createDefaultQuery(): Query {
    const query = {
      groups: [],
      display: '',
      consent: false,
    };
    const group = GroupFactory.createGroup(query);
    query.groups.push(group);

    return query;
  }
}
