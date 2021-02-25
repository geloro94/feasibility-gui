import { Component, Inject, OnInit } from '@angular/core'
import { Criterion } from '../../../../model/api/query/criterion'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { QueryProviderService } from '../../../../service/query-provider.service'
import { Query } from '../../../../model/api/query/query'
import { ObjectHelper } from '../../../../controller/ObjectHelper'

export class EditSingleCriterionComponentData {
  criterion: Criterion
  query: Query
}

@Component({
  selector: 'num-edit-single-criterion',
  templateUrl: './edit-single-criterion.component.html',
  styleUrls: ['./edit-single-criterion.component.scss'],
})
export class EditSingleCriterionComponent implements OnInit {
  queryModified: Query
  querySnapshot: Query
  criterion: Criterion

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditSingleCriterionComponentData,
    private provider: QueryProviderService,
    private dialogRef: MatDialogRef<EditSingleCriterionComponent>
  ) {
    this.criterion = data.criterion
    this.queryModified = data.query
    this.querySnapshot = ObjectHelper.clone(data.query)
  }

  ngOnInit(): void {}

  doSave(): void {
    this.provider.store(this.queryModified)
    this.dialogRef.close(this.queryModified)
  }

  doCancel(): void {
    this.provider.store(this.querySnapshot)
    this.dialogRef.close(this.querySnapshot)
  }
}