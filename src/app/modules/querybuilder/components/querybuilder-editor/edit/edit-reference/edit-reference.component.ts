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

  referenceCriterionsList: Array<Criterion> = [];

  constructor(
    private createCriterionService: CreateCriterionService,
    public provider: QueryProviderService
  ) {}

  ngOnInit() {
    this.referenceChecked = this.criterion.linkedCriteria.length > 0 ? true : false;
    this.createCriterionFromSingleReference();
  }

  selectCheckboxForReference(singleReferenceCriterion: Criterion) {
    if (!singleReferenceCriterion.isLinked) {
      this.setReference(singleReferenceCriterion);
    } else {
      this.deleteLinkedCriterion(singleReferenceCriterion);
    }
  }

  compareToLinkedCriteria(referenceCriterion: Criterion) {
    this.criterion.linkedCriteria.forEach((criteria) => {
      if (criteria.criterionHash === referenceCriterion.criterionHash) {
        this.referenceCriterionsList.push(criteria);
      } else {
        const exists = this.referenceCriterionsList.some(
          (item) => item.criterionHash === referenceCriterion.criterionHash
        );
        if (!exists) {
          this.referenceCriterionsList.push(referenceCriterion);
        }
      }
    });
  }

  createCriterionFromSingleReference() {
    this.referenceCriterionsList = [];
    this.referenceAttributes.forEach((reference) => {
      const referenceAttributeDefinition = reference.attributeDefinition;
      if (referenceAttributeDefinition.referencedOnlyOnce) {
        const singleReference = referenceAttributeDefinition.singleReference;
        this.createCriterionService
          .createCriterionFromTermCode(singleReference.termCodes, singleReference.context)
          .subscribe((referenceCriterion) => {
            if (this.criterion.linkedCriteria.length > 0) {
              this.compareToLinkedCriteria(referenceCriterion);
            } else {
              this.referenceCriterionsList.push(referenceCriterion);
            }
            console.log(this.referenceCriterionsList);
          });
      }
    });
  }

  setReference(singleReferenceCriterion?: Criterion) {
    singleReferenceCriterion.isLinked = true;
    singleReferenceCriterion.position = new CritGroupPosition();
    singleReferenceCriterion.entity = true;
    this.criterion.linkedCriteria.push(singleReferenceCriterion);
    console.log(this.criterion);
    this.query.groups[0].inclusionCriteria.push([singleReferenceCriterion]);
    this.setSelectableConceptsForCriterion(singleReferenceCriterion.termCodes[0]);
  }

  setSelectableConceptsForCriterion(referenceAttributeTermCode: TerminologyCode) {
    this.criterion.attributeFilters.forEach((attribureFilter) => {
      const attributeDefinition = attribureFilter.attributeDefinition;
      if (
        attributeDefinition.type === FilterTypes.REFERENCE &&
        attribureFilter.attributeDefinition.referencedOnlyOnce
      ) {
        attribureFilter.attributeDefinition.selectableConcepts.push(referenceAttributeTermCode);
      }
    });
    console.log(this.criterion);
    this.moveReferenceCriteria();
  }

  deleteLinkedCriterion(singleReferenceCriterion) {
    this.criterion.linkedCriteria.forEach((criteria, index) => {
      if (criteria.isLinked && criteria.uniqueID === singleReferenceCriterion.uniqueID) {
        criteria.isLinked = false;
        this.criterion.linkedCriteria.splice(index, 1);
      }
    });
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
