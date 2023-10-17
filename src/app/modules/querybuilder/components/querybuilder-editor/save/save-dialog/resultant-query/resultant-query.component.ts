import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Query } from 'src/app/modules/querybuilder/model/api/query/query';
import { BackendService } from 'src/app/modules/querybuilder/service/backend.service';
import { SaveDialogComponent } from '../save-dialog.component';

@Component({
  selector: 'num-resultant-query',
  templateUrl: './resultant-query.component.html',
  styleUrls: ['./resultant-query.component.scss'],
})
export class ResultantQueryComponent implements OnDestroy {
  title = '';

  comment = '';

  query: Query;

  saveButtonDisabled = true;

  constructor(
    public backend: BackendService,
    private dialogRef: MatDialogRef<SaveDialogComponent, void>
  ) {}

  private subscriptionResult: Subscription;

  ngOnDestroy(): void {
    this.subscriptionResult?.unsubscribe();
  }

  doSaveQuery(): void {
    this.subscriptionResult?.unsubscribe();
    this.subscriptionResult = this.backend
      .saveQuery(this.query, this.title, this.comment, true)
      .subscribe((response) => {});
  }

  isEmpty(): void {
    this.saveButtonDisabled = this.title !== '';
  }

  doDiscard(): void {
    this.dialogRef.close();
  }
}
