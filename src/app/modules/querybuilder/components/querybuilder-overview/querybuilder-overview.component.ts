import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { QueryProviderService } from '../../service/query-provider.service';
import { HttpClient } from '@angular/common/http';
import { Query } from '../../model/api/query/query';
import { Router } from '@angular/router';
import { BackendService } from '../../service/backend.service';
import { Subscription } from 'rxjs';
import { FeatureService } from '../../../../service/feature.service';
import { ApiTranslator } from '../../controller/ApiTranslator';
import { FeatureProviderService } from '../../service/feature-provider.service';
import { IAppConfig } from '../../../../config/app-config.model';

@Component({
  selector: 'num-querybuilder-overview',
  templateUrl: './querybuilder-overview.component.html',
  styleUrls: ['./querybuilder-overview.component.scss'],
})
export class QuerybuilderOverviewComponent implements OnInit {
  constructor(public queryProviderService: QueryProviderService, private backend: BackendService) {}

  private savedTemplatesSubscription: Subscription;

  savedTemplates: Array<{
    id?: number
    content?: Query
    label: string
    comment: string
    lastModified: Date
    createdBy?: string
    isValid?: boolean
  }> = [];

  ngOnInit(): void {}

  doValidate(): void {
    this.savedTemplatesSubscription = this.backend.loadSavedTemplates(true).subscribe((queries) => {
      this.savedTemplates = queries;
    });
  }
}
