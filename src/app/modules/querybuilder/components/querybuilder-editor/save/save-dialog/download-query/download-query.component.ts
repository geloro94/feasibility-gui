import { Component, Input } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { ApiTranslator } from 'src/app/modules/querybuilder/controller/ApiTranslator';
import { Query } from 'src/app/modules/querybuilder/model/api/query/query';
import { SaveDialogComponent } from '../save-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'num-download-query',
  templateUrl: './download-query.component.html',
  styleUrls: ['./download-query.component.scss'],
})
export class DownloadQueryComponent {
  downloadQuery: boolean;
  filename = '';

  @Input()
  query: Query;

  constructor(
    private fileSaverService: FileSaverService,
    private apiTranslator: ApiTranslator,
    private dialogRef: MatDialogRef<SaveDialogComponent, void>
  ) {}

  doDownloadQuery(): void {
    const queryString = JSON.stringify(this.apiTranslator.translateToV2(this.query));
    const fileData = new Blob([queryString], { type: 'text/plain;charset=utf-8' });
    this.fileSaverService.save(fileData, this.filename + '.json');
    this.dialogRef.close();
  }
}
