import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { QueryProviderService } from '../../service/query-provider.service';
import { HttpClient } from '@angular/common/http';
import { Query } from '../../model/api/query/query';
import { Router } from '@angular/router';
import { BackendService } from '../../service/backend.service';
import { Subscription } from 'rxjs';
import { FeatureProviderService } from '../../service/feature-provider.service';

@Component({
  selector: 'num-my-queries',
  templateUrl: './my-queries.component.html',
  styleUrls: ['./my-queries.component.scss'],
})
export class MyQueriesComponent implements OnInit, OnDestroy {
  constructor(
    public queryProviderService: QueryProviderService,
    private backend: BackendService,
    public featureProviderService: FeatureProviderService
  ) {}
  private savedTemplatesSubscription: Subscription;

  private savedQueriesSubscription: Subscription;

  isInvalid: boolean;

  isValid: boolean;

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

  doValidate(): void {
    this.savedTemplatesSubscription = this.backend.loadSavedTemplates(true).subscribe((queries) => {
      this.savedTemplates = queries;
    });
  }
}
