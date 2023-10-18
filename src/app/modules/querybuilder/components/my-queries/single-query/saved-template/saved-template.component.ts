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
  selector: 'num-saved-template',
  templateUrl: './saved-template.component.html',
  styleUrls: ['./saved-template.component.scss'],
})
export class SavedTemplateComponent implements OnInit, OnDestroy {
  @Input()
  singleTemplate;

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

  ngOnInit(): void {
    this.query = this.queryProviderService.query();
    this.features = this.featureProviderService.getFeatures();
    this.queryVersion = this.features.queryVersion;
  }

  ngOnDestroy(): void {
    this.singleTemplateSubscription?.unsubscribe();
    this.savedTemplatesSubscription?.unsubscribe();
  }

  getSingleTemplate(): void {
    if (this.feature.mockLoadnSave()) {
      this.navigateToEditor();
    } else {
      this.singleTemplateSubscription = this.backend
        .loadTemplate(this.singleTemplate.id)
        .subscribe((query) => {
          this.query = this.apiTranslator.translateSQtoUIQuery(
            QueryProviderService.createDefaultQuery(),
            query
          );
          this.navigateToEditor();
        });
    }
  }

  navigateToEditor() {
    this.queryProviderService.store(this.query);
    this.router.navigate(['/querybuilder/editor'], { state: { preventReset: true } });
  }
}
