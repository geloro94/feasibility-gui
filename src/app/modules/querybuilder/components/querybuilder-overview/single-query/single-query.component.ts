import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Query } from '../../../model/api/query/query';
import { QueryProviderService } from '../../../service/query-provider.service';
import { BackendService } from '../../../service/backend.service';
import { FeatureProviderService } from '../../../service/feature-provider.service';
import { EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'num-single-query',
  templateUrl: './single-query.component.html',
  styleUrls: ['./single-query.component.scss'],
})
export class SingleQueryComponent implements OnInit, OnDestroy {
  @Input()
  index: number;

  @Input()
  content: Query;

  @Input()
  isValid: boolean;

  @Output()
  reloadSavedQueries = new EventEmitter<boolean>();

  isInvalid: boolean;

  queryVersion: string;
  importQuery: Query;
  actionDisabled: boolean;

  query: Query;
  constructor(
    public queryProviderService: QueryProviderService,
    private backend: BackendService,
    public featureProviderService: FeatureProviderService
  ) {}

  private savedQueriesSubscription: Subscription;
  private savedTemplatesSubscription: Subscription;

  savedQueries: Array<{
    id: number
    label: string
    created_at: Date
  }> = [];

  savedTemplates: Array<{
    id?: number
    content?: Query
    label: string
    comment: string
    lastModified: Date
    createdBy?: string
    isValid?: boolean
  }> = [];

  ngOnInit(): void {
    this.getSavedQueries();
    this.getSavedTemplates();
    if (this.isValid === false) {
      this.isInvalid = true;
    }
  }

  ngOnDestroy(): void {
    this.savedQueriesSubscription?.unsubscribe();
    this.savedTemplatesSubscription?.unsubscribe();
  }

  getSavedTemplates() {
    this.savedTemplatesSubscription = this.backend.loadSavedTemplates().subscribe((templates) => {
      this.savedTemplates = templates;
    });
  }

  getSavedQueries(): void {
    this.savedQueriesSubscription = this.backend.loadSavedQueries().subscribe((queries) => {
      this.savedQueries = queries;
    });
  }
}
