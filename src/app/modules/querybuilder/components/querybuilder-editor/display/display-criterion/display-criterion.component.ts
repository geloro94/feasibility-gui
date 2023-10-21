import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Criterion } from '../../../../model/api/query/criterion';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditSingleCriterionComponent } from '../../edit/edit-single-criterion/edit-single-criterion.component';
import { Query } from '../../../../model/api/query/query';
import { Subscription } from 'rxjs';
import { OperatorOptions, ValueFilter } from '../../../../model/api/query/valueFilter';
import { FeatureService } from '../../../../../../service/feature.service';
import { CritGroupPosition } from '../../../../controller/CritGroupArranger';
import { ValueType } from 'src/app/modules/querybuilder/model/api/terminology/valuedefinition';
import { TerminologyCode } from 'src/app/modules/querybuilder/model/api/terminology/terminology';

@Component({
  selector: 'num-display-criterion',
  templateUrl: './display-criterion.component.html',
  styleUrls: ['./display-criterion.component.scss'],
})
export class DisplayCriterionComponent implements OnInit, OnDestroy {
  valueType: OperatorOptions;

  attributeDefinitionConcepts: Array<TerminologyCode>;

  valueDefinitionConcepts: Array<TerminologyCode>;

  linkedCriterias: Array<Criterion>;

  @Input()
  searchType: string;

  @Input()
  criterion: Criterion;

  @Input()
  linkedCriterion: Criterion;

  @Input()
  query: Query;

  @Input()
  position: CritGroupPosition;

  @Input()
  showCancelButton: boolean;

  @Output()
  delete = new EventEmitter<Criterion>();

  @Output()
  storeQuery = new EventEmitter<Query>();

  private subscriptionDialog: Subscription;
  isinvalid: boolean;

  constructor(public dialog: MatDialog, public featureService: FeatureService) {}

  ngOnInit(): void {
    this.criterion.position = this.position;
    this.isinvalid = this.criterion.isinvalid === true;
    this.getAttributeFilters();
    this.getTypeConceptValues();
    this.getTypeConceptAttributes();
    this.getTypeReferenceAttributes();
  }

  ngOnDestroy(): void {
    this.subscriptionDialog?.unsubscribe();
  }

  openDetailsPopUp(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      criterion: this.criterion,
      query: this.query,
      position: this.position,
      searchType: this.searchType,
    };
    const dialogRef = this.dialog.open(EditSingleCriterionComponent, dialogConfig);
    this.subscriptionDialog?.unsubscribe();
    this.subscriptionDialog = dialogRef.afterClosed().subscribe((query) => {
      this.storeQuery.emit(query);
      this.getAttributeFilters();
      this.getTypeConceptValues();
      this.getTypeConceptAttributes();
      this.getTypeReferenceAttributes();
    });
  }

  doDelete(): void {
    this.delete.emit(this.criterion);
  }

  getValueFilters(): ValueFilter[] {
    if (this.criterion.valueFilters) {
      if (!this.featureService.useFeatureMultipleValueDefinitions()) {
        return this.criterion.valueFilters.length === 0 ? [] : [this.criterion.valueFilters[0]];
      }

      return this.criterion.valueFilters;
    } else {
      return [];
    }
  }
  getAttributeFilters(): ValueFilter[] {
    if (this.criterion.attributeFilters) {
      if (!this.featureService.useFeatureMultipleValueDefinitions()) {
        return this.criterion.attributeFilters.length === 0
          ? []
          : [this.criterion.attributeFilters[0]];
      }
      return this.criterion.attributeFilters;
    } else {
      return [];
    }
  }

  getTypeConceptAttributes(): void {
    if (this.criterion.attributeFilters) {
      this.criterion.attributeFilters.forEach((attributeFilter) => {
        if (attributeFilter.type === OperatorOptions.CONCEPT) {
          this.attributeDefinitionConcepts = attributeFilter.selectedConcepts;
        }
      });
    }
  }

  getTypeReferenceAttributes(): void {
    if (this.criterion.attributeFilters) {
      this.criterion.attributeFilters.forEach((attributeFilter) => {
        if (attributeFilter.type === OperatorOptions.REFERENCE) {
          this.getLinkedCriterias(this.criterion.linkedCriteria);
          console.log(this.criterion);
        }
      });
    }
  }

  getLinkedCriterias(linkedCriterias: Array<Criterion>) {
    linkedCriterias.forEach((linkedCriteria) => {
      this.linkedCriterias = [linkedCriteria];
      console.log(this.linkedCriterias);
    });
  }

  getTypeConceptValues(): void {
    if (this.criterion.valueFilters) {
      this.criterion.valueFilters.forEach((valueFilter) => {
        if (valueFilter.type === OperatorOptions.CONCEPT) {
          this.valueDefinitionConcepts = valueFilter.selectedConcepts;
        }
      });
    }
  }
}
