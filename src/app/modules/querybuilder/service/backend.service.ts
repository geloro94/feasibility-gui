import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CategoryEntry, TerminologyEntry } from '../model/api/terminology/terminology'
import { AppConfigService } from '../../../config/app-config.service'
import { Observable, of } from 'rxjs'
import { FeatureService } from '../../../service/feature.service'
import { Query } from '../model/api/query/query'
import { QueryResponse } from '../model/api/result/QueryResponse'
import { QueryResult } from '../model/api/result/QueryResult'
import { MockBackendDataProvider } from './MockBackendDataProvider'
import { ApiTranslator } from '../controller/ApiTranslator'

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(
    private config: AppConfigService,
    private feature: FeatureService,
    private http: HttpClient
  ) {}
  private static PATH_ROOT_ENTRIES = 'terminology/root-entries'
  private static PATH_TERMINOLOGY_SUBTREE = 'terminology/entries'
  private static PATH_SEARCH = 'terminology/selectable-entries'
  private static PATH_RUN_QUERY = 'query-handler/run-query'

  public static MOCK_RESULT_URL = 'http://localhost:9999/result-of-query/12345'

  private readonly mockBackendDataProvider = new MockBackendDataProvider()
  lowerBoundary: number = this.feature.getPatientResultLowerBoundary()

  public getCategories(): Observable<Array<CategoryEntry>> {
    if (this.feature.mockTerminology()) {
      return of(this.mockBackendDataProvider.getCategoryEntries())
    }

    return this.http.get<Array<CategoryEntry>>(this.createUrl(BackendService.PATH_ROOT_ENTRIES))
  }

  public getTerminolgyTree(id: string): Observable<TerminologyEntry> {
    if (this.feature.mockTerminology()) {
      return of(this.mockBackendDataProvider.getTerminologyEntry(id))
    }

    return this.http.get<TerminologyEntry>(
      this.createUrl(BackendService.PATH_TERMINOLOGY_SUBTREE + '/' + id)
    )
  }

  public getTerminolgyEntrySearchResult(
    catId: string,
    search: string
  ): Observable<Array<TerminologyEntry>> {
    if (this.feature.mockTerminology()) {
      return of(this.mockBackendDataProvider.getTerminolgyEntrySearchResult(catId, search))
    }

    const queryParam = 'query=' + search.toUpperCase() + (catId ? '&categoryId=' + catId : '')
    const url = this.createUrl(BackendService.PATH_SEARCH, queryParam)

    return this.http.get<Array<TerminologyEntry>>(url)
  }

  public postQuery(query: Query): Observable<QueryResponse> {
    if (this.feature.mockQuery()) {
      return of({ location: BackendService.MOCK_RESULT_URL })
    }

    const queryV1 = new ApiTranslator().translateToV1(query)
    return this.http.post<QueryResponse>(this.createUrl(BackendService.PATH_RUN_QUERY), queryV1)
  }

  public getResult(resultUrl: string): Observable<QueryResult> {
    if (this.feature.mockResult()) {
      const result = {
        totalNumberOfPatients: Math.floor(Math.random() * 1000),
        queryId: '12345',
        resultLines: [],
      }

      return of(result)
    }

    return this.http.get<QueryResult>(resultUrl)
  }

  createUrl(pathToResource: string, paramString?: string): string {
    let url = this.config.getConfig().uiBackendApi.baseUrl

    if (!url.endsWith('/')) {
      url += '/'
    }

    url += pathToResource

    if (paramString) {
      url += '?' + paramString
    }

    return url
  }

  obfuscateResult(result: number): string {
    if (result <= this.lowerBoundary) {
      return '< ' + this.lowerBoundary.toString()
    } else {
      return result.toString()
    }
  }
}
