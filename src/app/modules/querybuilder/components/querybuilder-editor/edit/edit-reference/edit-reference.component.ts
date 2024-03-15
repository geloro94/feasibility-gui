import { Component, Input, OnInit } from '@angular/core';
import { single } from 'rxjs';
import { AttributeFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { Criterion } from 'src/app/model/FeasibilityQuery/Criterion/Criterion';
import { Query } from 'src/app/model/FeasibilityQuery/Query';
import { FilterTypes } from 'src/app/model/FilterTypes';
import { TerminologyCode, TerminologyEntry } from 'src/app/model/terminology/Terminology';
import { UIProfile } from 'src/app/model/terminology/UIProfile';
import {
  CritGroupArranger,
  CritGroupPosition,
} from 'src/app/modules/querybuilder/controller/CritGroupArranger';
import { QueryProviderService } from 'src/app/modules/querybuilder/service/query-provider.service';
import { CreateCriterionService } from 'src/app/service/CriterionService/CreateCriterion.service';

@Component({
  selector: 'num-edit-reference',
  templateUrl: './edit-reference.component.html',
  styleUrls: ['./edit-reference.component.scss'],
})
export class EditReferenceComponent implements OnInit {
  @Input()
  referenceAttributes: Array<AttributeFilter> = [];

  @Input()
  criterion: Criterion;

  @Input()
  query: Query;

  referenceChecked = false;

  referenceCriterion: Criterion = new Criterion();

  constructor(
    private createCriterionService: CreateCriterionService,
    public provider: QueryProviderService
  ) {}

  ngOnInit() {
    console.log(this.referenceAttributes);
    this.referenceChecked = this.criterion.linkedCriteria.length > 0 ? true : false;
    this.createCriterionFromSingleReference();
  }

  selectCheckboxForReference() {
    if (this.referenceChecked) {
      this.setReference();
    } else {
      this.deleteLinkedCriterion();
    }
  }

  createCriterionFromSingleReference() {
    this.referenceAttributes.forEach((reference) => {
      const referenceAttributeDefinition = reference.attributeDefinition;
      if (referenceAttributeDefinition.referenceOnlyOnce) {
        this.createCriterionService
          .createCriterionFromTermCode(
            referenceAttributeDefinition.singleReference.termCodes,
            referenceAttributeDefinition.singleReference.context
          )
          .subscribe((refernceCriterion) => {
            this.referenceCriterion = refernceCriterion;
            this.referenceCriterion.termCodes[0] =
              referenceAttributeDefinition.singleReference.termCodes[0];
          });
      }
    });
  }

  setReference() {
    this.referenceCriterion.isLinked = true;
    this.referenceCriterion.position = new CritGroupPosition();
    this.referenceCriterion.entity = true;
    this.criterion.linkedCriteria.push(this.referenceCriterion);
    this.query.groups[0].inclusionCriteria.push([this.referenceCriterion]);
    this.setSelectableConceptsForCriterion(this.referenceCriterion.termCodes[0]);
  }

  setSelectableConceptsForCriterion(referenceAttributeTermCode: TerminologyCode) {
    this.criterion.attributeFilters.forEach((attribureFilter) => {
      const attributeDefinition = attribureFilter.attributeDefinition;
      if (
        attributeDefinition.type === FilterTypes.REFERENCE &&
        attribureFilter.attributeDefinition.referenceOnlyOnce
      ) {
        attribureFilter.attributeDefinition.selectableConcepts.push(referenceAttributeTermCode);
      }
    });
    this.moveReferenceCriteria();
    this.query.groups[0].inclusionCriteria.push([this.criterion]);
  }

  deleteLinkedCriterion() {
    this.criterion.linkedCriteria = [];
    this.query.groups[0].inclusionCriteria.push([this.criterion]);
  }

  moveReferenceCriteria(): void {
    for (const inex of ['inclusion', 'exclusion']) {
      let x = 0;
      this.query.groups[0][inex + 'Criteria'].forEach((disj) => {
        let y = 0;
        disj.forEach((conj) => {
          if (conj.isLinked) {
            this.query.groups = CritGroupArranger.moveCriterionToEndOfGroup(
              this.query.groups,
              {
                groupId: conj.position.groupId,
                critType: conj.position.critType,
                column: conj.position.column - y,
                row: conj.position.row - x,
              },
              {
                groupId: conj.position.groupId,
                critType: conj.position.critType,
                column: -1,
                row: -1,
              }
            );
            if (disj.length === 1) {
              x++;
            }
            if (disj.length > 1) {
              y++;
            }
            this.rePosition();
          }
        });
      });
    }
  }
  rePosition(): void {
    for (const inex of ['inclusion', 'exclusion']) {
      this.query.groups[0][inex + 'Criteria'].forEach((disj, i) => {
        disj.forEach((conj, j) => {
          conj.position.row = i;
          conj.position.column = j;
        });
      });
    }
  }
}
