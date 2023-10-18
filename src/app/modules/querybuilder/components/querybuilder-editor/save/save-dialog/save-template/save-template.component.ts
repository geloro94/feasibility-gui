import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Query } from 'src/app/modules/querybuilder/model/api/query/query';
import { BackendService } from 'src/app/modules/querybuilder/service/backend.service';
import { SaveDialogComponent } from '../save-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'num-save-template',
  templateUrl: './save-template.component.html',
  styleUrls: ['./save-template.component.scss'],
})
export class SaveTemplateComponent implements OnDestroy {
  title = '';

  comment = '';

  @Input()
  query: Query;

  constructor(
    private dialogRef: MatDialogRef<SaveDialogComponent, void>,
    public backend: BackendService
  ) {}

  private subscriptionResult: Subscription;

  ngOnDestroy(): void {
    this.subscriptionResult?.unsubscribe();
  }

  doSaveTemplate(): void {
    console.log(this.query);
    this.subscriptionResult = this.backend
      .saveQuery(this.query, this.title, this.comment, false)
      .subscribe(() => {
        this.dialogRef.close();
      });
  }
}
