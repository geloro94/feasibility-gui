import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Criterion } from '../../../../../../model/FeasibilityQuery/Criterion/Criterion';
import { CritGroupArranger } from '../../../../controller/CritGroupArranger';
import { CritType, Group } from '../../../../../../model/FeasibilityQuery/Group';
import { EditGroupConnectionComponent } from '../../edit/edit-group-connection/edit-group-connection.component';
import { FeatureService } from '../../../../../../service/Feature.service';
import { GroupFactory } from '../../../../controller/GroupFactory';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ObjectHelper } from '../../../../controller/ObjectHelper';
import { Query } from '../../../../../../model/FeasibilityQuery/Query';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
//import { CritType, Group } from '../../../../model/api/query/group';
//import { Criterion } from '../../../../model/api/query/criterion';
//import { Query } from '../../../../model/api/query/query';

@Component({
  selector: 'num-display-group',
  templateUrl: './display-group.component.html',
  styleUrls: ['./display-group.component.scss'],
})
export class DisplayGroupComponent implements OnInit {
  @Input()
  group: Group;

  @Input()
  searchType: string;

  @Input()
  parentGroup: Group;

  @Input()
  query: Query;

  @Input()
  first = false;

  @Output()
  dropped = new EventEmitter();

  @Output()
  storeQuery = new EventEmitter<Query>();

  @Output()
  saveGroup = new EventEmitter<Group>();

  @Output()
  moveUp = new EventEmitter<Group>();

  @Output()
  moveDown = new EventEmitter<Group>();

  subscriptionTranslation: Subscription;
  subscriptionDialog: Subscription;

  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private translation: TranslateService,
    public featureService: FeatureService
  ) {}

  ngOnInit(): void {}

  doDrop($event: any): void {
    this.dropped.emit($event);
  }

  switch(critType: CritType, $event: Criterion[][]): void {
    if (critType === 'inclusion') {
      this.group.inclusionCriteria = $event;
    } else {
      this.group.exclusionCriteria = $event;
    }

    this.doStoreQuery(this.query);
  }

  doStoreQuery(query: Query): void {
    this.storeQuery.emit(query);
  }

  doDelete({ row, column }: { row: number; column: number }, critType: CritType): void {
    this.group = CritGroupArranger.removeFromGroup(
      this.group,
      {
        groupId: this.group.id,
        critType,
        row,
        column,
      },
      'delete'
    );

    this.saveGroup.emit(this.group);
  }

  switchLinkedStatus(): void {
    if (!this.group.dependencyInfo) {
      this.group.dependencyInfo = GroupFactory.createGroupDependencyInfo();
    }

    this.group.dependencyInfo.linked = !this.group.dependencyInfo.linked;

    this.doStoreQuery(this.query);
  }

  deleteGroup(id: number): void {
    const clonedGroups = ObjectHelper.clone(this.query.groups);
    const index = clonedGroups.findIndex((groupTemp) => groupTemp.id === id);

    if (index + 1 < clonedGroups.length && clonedGroups[index + 1].dependencyInfo?.linked) {
      this.showHintNotDeletedLinkedParentGroup();
      return;
    }

    if (index >= 0) {
      clonedGroups.splice(index, 1);
    }

    this.query.groups = clonedGroups;

    this.storeQuery.emit(this.query);
  }

  showHintNotDeletedLinkedParentGroup(): void {
    this.subscriptionTranslation?.unsubscribe();
    this.subscriptionTranslation = this.translation
      .get('QUERYBUILDER.DISPLAY.GROUPS.HINT_NOT_DELETABLE_LINKED_GROUP')
      .subscribe((text) => {
        this.snackBar.open(text, '', { duration: 2000 });
      });
  }

  isLinked(): boolean {
    return this.group.dependencyInfo && this.group.dependencyInfo.linked;
  }

  doMoveDown(): void {
    this.moveDown.emit();
  }

  doMoveUp(): void {
    this.moveUp.emit();
  }

  editConnection(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      connection: this.group.dependencyInfo,
      dependentGroup: this.group,
      parentGroup: this.parentGroup,
      query: this.query,
    };

    const dialogRef = this.dialog.open(EditGroupConnectionComponent, dialogConfig);
    this.subscriptionDialog = dialogRef
      .afterClosed()
      .subscribe((query) => this.storeQuery.emit(query));
  }
}
