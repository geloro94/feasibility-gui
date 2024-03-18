import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
//import { TerminologyEntry } from '../../../../model/api/terminology/terminology';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import { Criterion } from '../../../../model/api/query/criterion';
import { TermEntry2CriterionTranslator } from '../../../../controller/TermEntry2CriterionTranslator';
//import { CritType } from '../../../../model/api/query/group';
import { Query as QueryOld } from '../../../../model/api/query/query';
import { QueryProviderService } from '../../../../service/query-provider.service';
import { FeatureService } from '../../../../../../service/Feature.service';
import { Criterion } from '../../../../../../model/FeasibilityQuery/Criterion/Criterion';
import { Query } from '../../../../../../model/FeasibilityQuery/Query';
import { CritType } from '../../../../../../model/FeasibilityQuery/Group';
import { TerminologyEntry } from '../../../../../../model/terminology/Terminology';
import { TermEntry2CriterionTranslatorService } from 'src/app/service/TermEntry2CriterionTranslator.service';
import { CreateCriterionService } from 'src/app/service/CriterionService/CreateCriterion.service';

export class EnterCriterionListComponentData {
  groupIndex: number;
  critType: CritType;
  termEntryList: Array<TerminologyEntry>;
  query: Query;
  searchType: string;
}

@Component({
  selector: 'num-enter-criterion-list',
  templateUrl: './enter-criterion-list.component.html',
  styleUrls: ['./enter-criterion-list.component.scss'],
})
export class EnterCriterionListComponent implements OnInit, OnDestroy {
  criterionList: Array<Criterion> = [];
  groupIndex: number;
  critType: CritType;
  query: Query;
  searchType: string;
  actionDisabled = true;
  criterionAddibleList: Array<{
    criterion: Criterion
    groupID: number
    isAddible: boolean
  }> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EnterCriterionListComponentData,
    private dialogRef: MatDialogRef<EnterCriterionListComponent, void>,
    public provider: QueryProviderService,
    public featureService: FeatureService,
    private termEntryTranslator: CreateCriterionService
  ) {
    this.critType = data.critType;
    this.groupIndex = data.groupIndex;
    this.query = data.query;
    this.searchType = data.searchType;
  }

  ngOnInit(): void {
    this.translateTermEntries();
  }

  ngOnDestroy(): void {}

  translateTermEntries() {
    this.data.termEntryList.forEach((termEntry) => {
      this.termEntryTranslator
        .createCriterionFromTermCode(termEntry.termCodes, termEntry.context)
        .subscribe((criterion) => {
          criterion.termCodes = termEntry.termCodes;
          this.criterionList.push(criterion);
        });
    });
  }

  doSave(event: { groupId: number }, criterion: Criterion): void {
    if (this.searchType === 'dataselection') {
      criterion.requiredDataSelection = false;
    }

    const index = this.query.groups.findIndex((group) => group.id === event.groupId);

    if (index < 0) {
      return;
    }

    if (this.critType === 'inclusion') {
      this.query.groups[index].inclusionCriteria.push([criterion]);
    } else {
      this.query.groups[index].exclusionCriteria.push([criterion]);
    }

    this.provider.store(this.query);
    this.doDiscard(criterion);
  }

  doSaveAll() {
    if (this.critType === 'inclusion') {
      this.query.groups[0].inclusionCriteria.push(this.criterionList);
    } else {
      this.query.groups[0].exclusionCriteria.push(this.criterionList);
    }
    this.provider.store(this.query);
    this.dialogRef.close();
  }

  getAddibleList(): Array<any> {
    return this.criterionAddibleList.filter((list) => list.isAddible);
  }

  doDiscard(criterion: Criterion): void {
    const index = this.criterionList.findIndex((critrionTemp) => critrionTemp === criterion);
    const index2 = this.criterionAddibleList.findIndex(
      (critrionTemp) => critrionTemp.criterion === criterion
    );

    this.criterionList.splice(index, 1);
    this.criterionAddibleList.splice(index2, 1);
    if (this.criterionList.length === 0) {
      this.dialogRef.close();
    }
  }

  doDiscardAll(): void {
    this.dialogRef.close();
  }
}
