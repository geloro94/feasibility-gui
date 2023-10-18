import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Query } from 'src/app/modules/querybuilder/model/api/query/query';
import { BackendService } from 'src/app/modules/querybuilder/service/backend.service';

@Component({
  selector: 'num-save-template',
  templateUrl: './save-template.component.html',
  styleUrls: ['./save-template.component.scss'],
})
export class SaveTemplateComponent implements OnDestroy {
  title = '';

  comment = '';

  query: Query;

  constructor(public backend: BackendService) {}

  private subscriptionResult: Subscription;

  ngOnDestroy(): void {
    this.subscriptionResult?.unsubscribe();
  }

  doSaveTemplate(): void {
    this.subscriptionResult?.unsubscribe();
    this.subscriptionResult = this.backend
      .saveQuery(this.query, this.title, this.comment, false)
      .subscribe(() => {});
  }
}
