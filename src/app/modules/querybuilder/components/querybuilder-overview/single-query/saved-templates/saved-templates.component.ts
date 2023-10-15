import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiTranslator } from 'src/app/modules/querybuilder/controller/ApiTranslator';
import { BackendService } from 'src/app/modules/querybuilder/service/backend.service';
import { FeatureProviderService } from 'src/app/modules/querybuilder/service/feature-provider.service';
import { QueryProviderService } from 'src/app/modules/querybuilder/service/query-provider.service';
import { FeatureService } from 'src/app/service/feature.service';
import { Query } from 'src/app/modules/querybuilder/model/api/query/query';
import { Subscription } from 'rxjs';
import { IAppConfig } from 'src/app/config/app-config.model';

@Component({
  selector: 'num-saved-templates',
  templateUrl: './saved-templates.component.html',
  styleUrls: ['./saved-templates.component.scss'],
})
export class SavedTemplatesComponent implements OnInit, OnDestroy {
  @Input()
  singleLabel: string;

  @Input()
  singleComment: string;

  @Input()
  singleDate: Date;

  query: Query;
  queryVersion: string;
  isInvalid: boolean;

  constructor(
    public queryProviderService: QueryProviderService,
    private router: Router,
    private backend: BackendService,
    private feature: FeatureService,
    public featureProviderService: FeatureProviderService,
    private apiTranslator: ApiTranslator
  ) {}

  private savedTemplatesSubscription: Subscription;
  private singleTemplateSubscription: Subscription;
  private features: IAppConfig;

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
    this.query = this.queryProviderService.query();
    this.savedTemplatesSubscription?.unsubscribe();
    this.savedTemplatesSubscription = this.backend.loadSavedTemplates().subscribe((templates) => {
      this.savedTemplates = templates;
    });
    this.features = this.featureProviderService.getFeatures();
    this.queryVersion = this.features.queryVersion;
  }

  ngOnDestroy(): void {
    this.singleTemplateSubscription?.unsubscribe();
    this.savedTemplatesSubscription?.unsubscribe();
  }

  loadTemplate(): void {
    if (this.feature.mockLoadnSave()) {
      this.queryProviderService.store(this.query);
      this.router.navigate(['/querybuilder/editor'], { state: { preventReset: true } });
    } else {
      this.singleTemplateSubscription = this.backend
        .loadTemplate(this.savedTemplates.id)
        .subscribe((query) => {
          this.query = this.apiTranslator.translateSQtoUIQuery(
            QueryProviderService.createDefaultQuery(),
            query
          );
          this.queryProviderService.store(this.query);
          this.router.navigate(['/querybuilder/editor'], { state: { preventReset: true } });
        });
    }
  }
}
