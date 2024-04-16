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
import { QueryService } from 'src/app/service/QueryService.service';

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
  optionalCriteria: Array<Criterion> = [];
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
    private termEntryTranslator: CreateCriterionService,
    private queryService: QueryService
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
          this.createNonOptionalListOfCriterions(criterion);
        });
    });
  }

  doSave(event: { groupId: number }, criterion: Criterion): void {
    if (this.searchType === 'dataselection') {
      criterion.requiredDataSelection = false;
    }

    if (this.critType === 'inclusion') {
      this.query.groups[0].inclusionCriteria.push([criterion]);
    } else {
      this.query.groups[0].exclusionCriteria.push([criterion]);
    }
    this.provider.store(this.query);
  }

  doSaveAll() {
    if (this.optionalCriteria.length === 0) {
      this.actionDisabled = false;
      let index = this.criterionList.length - 1; // Start from the last index

      while (index >= 0) {
        const criterion = this.criterionList[index];
        this.doSave({ groupId: 0 }, criterion);
        this.criterionList.splice(index, 1); // Remove the processed criterion
        index--; // Move to the previous index
      }

      this.doDiscardAll();
    }
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

  createNonOptionalListOfCriterions(criterion: Criterion) {
    criterion.attributeFilters?.forEach((attributeFilter) => {
      if (!attributeFilter.attributeDefinition.optional) {
        this.optionalCriteria.push(criterion);
      }
    });
    criterion.valueFilters?.forEach((valueFilter) => {
      if (
        !valueFilter.valueDefinition?.optional &&
        valueFilter.valueDefinition?.selectableConcepts.length > 0
      ) {
        this.optionalCriteria.push(criterion);
      }
    });
    this.setSaveAllBollean();
  }

  setSaveAllBollean() {
    console.log(this.optionalCriteria);
    if (this.optionalCriteria.length === 0) {
      this.actionDisabled = false;
    }
  }

  compareNonOptionalListWithFeasibilityQuery() {
    this.queryService.getCriterionMap().subscribe((map) => {
      this.optionalCriteria = this.optionalCriteria.filter((criterion) => !map.has(criterion.criterionHash));
    });
    this.setSaveAllBollean();
  }
}
