import { ApiTranslator } from '../../../../controller/ApiTranslator';
import { BackendService } from '../../../../service/backend.service';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Query } from 'src/app/model/FeasibilityQuery/Query';
import { QueryProviderService } from '../../../../service/query-provider.service';
import { Subscription } from 'rxjs';
import { UIQuery2StructuredQueryTranslatorService } from 'src/app/service/UIQuery2StructuredQueryTranslator.service';
/* eslint-disable */

export class SaveDialogComponentData {
  hasQuerySend: boolean | string
}
@Component({
  selector: 'num-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent implements OnInit, OnDestroy {
  private subscriptionResult: Subscription
  hasQuerySend: boolean | string

  constructor(
    private UITranslator: UIQuery2StructuredQueryTranslatorService,
    public queryProviderService: QueryProviderService,
    public backend: BackendService,
    private fileSaverService: FileSaverService,
    @Inject(MAT_DIALOG_DATA) public data: SaveDialogComponentData,
    private dialogRef: MatDialogRef<SaveDialogComponent, void>,
    private apiTranslator: ApiTranslator
  ) {
    this.hasQuerySend = data.hasQuerySend
  }

  query: Query
  title = ''
  comment = ''
  filename = ''
  saveWithQuery: boolean | string = false
  letQuerySave: boolean
  saveButtonDisabled: boolean = true
  downloadQuery: boolean = false

  ngOnInit(): void {
    //TODO query deactivated, because of version difference
    this.query = this.queryProviderService.query()
    this.hasQuerySend === false ? (this.letQuerySave = true) : (this.letQuerySave = false)
    this.saveWithQuery = this.hasQuerySend
  }
  ngOnDestroy(): void {
    this.subscriptionResult?.unsubscribe()
  }
  doSave(): void {
    if (this.downloadQuery) {
      const queryString = JSON.stringify(this.UITranslator.translateToStructuredQuery(this.query))
      const fileData = new Blob([queryString], { type: 'text/plain;charset=utf-8' })
      this.fileSaverService.save(fileData, this.filename + '.json')
    } else {
      this.subscriptionResult?.unsubscribe()
      //TODO query deactivated, because of version difference
      this.subscriptionResult = this.backend
        .saveQuery(this.query, this.title, this.comment, this.saveWithQuery)
        .subscribe((response) => {
          //  console.log(response)
        })
    }
    this.dialogRef.close()
    // this.router.navigate(['/querybuilder/overview'])
  }

  doSaveForDataselection() {}

  doDiscard(): void {
    this.dialogRef.close()
  }

  setQuerySaving(mode: MatRadioChange): void {
    if (mode.value === 'template') {
      this.saveWithQuery = false
      this.downloadQuery = false
    }
    if (mode.value === 'saveQuery') {
      this.saveWithQuery = this.hasQuerySend
      this.downloadQuery = false
    }
    if (mode.value === 'download') {
      this.downloadQuery = true
    }
    this.isEmpty()
  }

  isEmpty(): void {
    this.saveButtonDisabled = !(
      (this.downloadQuery && this.filename !== '') ||
      (!this.downloadQuery && this.title !== '')
    )
  }
}
