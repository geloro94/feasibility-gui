import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { QueryProviderService } from '../../../service/query-provider.service';
import { FeatureProviderService } from '../../../service/feature-provider.service';
import { ApiTranslator } from '../../../controller/ApiTranslator';
import { Query } from '../../../model/api/query/query';

@Component({
  selector: 'num-import-query',
  templateUrl: './import-query.component.html',
  styleUrls: ['./import-query.component.scss'],
})
export class ImportQueryComponent implements AfterViewChecked {
  fileName: string;
  importQuery: Query;
  query: Query;
  actionDisabled: boolean;

  constructor(
    public queryProviderService: QueryProviderService,
    private router: Router,
    public featureProviderService: FeatureProviderService,
    private apiTranslator: ApiTranslator,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngAfterViewChecked(): void {
    if (this.importQuery) {
      this.actionDisabled = false;
    } else {
      this.actionDisabled = true;
    }
    this.changeDetector.detectChanges();
  }

  doImportFromFile(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = this.onReaderLoad.bind(this);
    reader.readAsText(file);
    this.fileName = file.name;
  }

  onReaderLoad(event): void {
    this.importQuery = JSON.parse(event.target.result);
  }

  doImport(): void {
    this.query = this.apiTranslator.translateImportedSQtoUIQuery(
      QueryProviderService.createDefaultQuery(),
      this.importQuery
    );
    this.queryProviderService.store(this.query);
    this.router.navigate(['/querybuilder/editor'], { state: { preventReset: true } });
  }
}
