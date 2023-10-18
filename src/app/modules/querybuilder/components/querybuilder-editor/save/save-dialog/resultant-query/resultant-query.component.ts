import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Query } from 'src/app/modules/querybuilder/model/api/query/query';
import { BackendService } from 'src/app/modules/querybuilder/service/backend.service';

@Component({
  selector: 'num-resultant-query',
  templateUrl: './resultant-query.component.html',
  styleUrls: ['./resultant-query.component.scss'],
})
export class ResultantQueryComponent implements OnInit, OnDestroy {
  title = '';

  comment = '';

  query: Query;

  @Input()
  letQuerySave: boolean;

  saveButtonDisabled = true;

  constructor(public backend: BackendService) {}

  private subscriptionResult: Subscription;

  ngOnInit() {
    this.querySaveComparison();
  }

  ngOnDestroy(): void {
    this.subscriptionResult?.unsubscribe();
  }

  querySaveComparison() {
    if (this.letQuerySave && this.title.length > 0) {
      this.saveButtonDisabled = false;
    }
  }

  doSaveQuery(): void {
    this.subscriptionResult?.unsubscribe();
    this.subscriptionResult = this.backend
      .saveQuery(this.query, this.title, this.comment, true)
      .subscribe((response) => {});
  }
}
