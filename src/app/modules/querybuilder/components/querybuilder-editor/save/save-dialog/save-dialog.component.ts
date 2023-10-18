/* eslint-disable */
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { Query } from '../../../../model/api/query/query'
import { QueryProviderService } from '../../../../service/query-provider.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { BackendService } from '../../../../service/backend.service'
import { Subscription } from 'rxjs'
import { MatRadioChange } from '@angular/material/radio'
import { FileSaverService } from 'ngx-filesaver'
import { ApiTranslator } from '../../../../controller/ApiTranslator'

export class SaveDialogComponentData {
  hasQuerySend: boolean | string
}
@Component({
  selector: 'num-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subscriptionResult: Subscription
  private querySlotCountSubscription: Subscription

  hasQuerySend: boolean | string

  constructor(
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
  letQuerySave: boolean = false
  saveButtonDisabled: boolean = true
  downloadQuery: boolean = false
  querySlotAvailable: boolean = false

  ngOnInit(): void {
    this.query = this.queryProviderService.query()
    this.saveWithQuery = this.hasQuerySend
    this.isQuerySlotAvailable()
    this.querySaveComparison()
  }

  ngAfterViewChecked() {
    this.dialogRef.afterOpened().subscribe(() => {
      this.querySentStatus()
    })
  }

  ngOnDestroy(): void {
    this.subscriptionResult?.unsubscribe()
    this.querySlotCountSubscription.unsubscribe()
  }

  querySentStatus(): void {
    if (typeof this.data.hasQuerySend === 'number') {
      this.hasQuerySend = true
      this.querySaveComparison()
    } else {
      this.hasQuerySend = false
    }
  }
  querySaveComparison() {
    this.isQuerySlotAvailable()
    if (this.hasQuerySend && this.querySlotAvailable) {
      this.letQuerySave = true
    }
  }

  isQuerySlotAvailable(): void {
    this.querySlotCountSubscription = this.backend
      .getSavedQuerySlotCount()
      .subscribe((querySlotCount) => {
        this.querySlotAvailable = querySlotCount.total > querySlotCount.used ? true : false
      })
  }
}
