import { AttributeFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { Component, Input, OnInit } from '@angular/core';
import { CreateCriterionService } from 'src/app/service/CriterionService/CreateCriterion.service';
import { Criterion } from 'src/app/model/FeasibilityQuery/Criterion/Criterion';
import { FilterTypes } from 'src/app/model/FilterTypes';
import { Query } from 'src/app/model/FeasibilityQuery/Query';
import { QueryProviderService } from 'src/app/modules/querybuilder/service/query-provider.service';
import { TerminologyCode } from 'src/app/model/terminology/Terminology';
import {
  CritGroupArranger,
  CritGroupPosition,
} from 'src/app/modules/querybuilder/controller/CritGroupArranger';

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

  singleReferenceCriterion: Criterion = new Criterion();

  referenceCriterions: Array<Criterion> = [];

  constructor(
    private createCriterionService: CreateCriterionService,
    public provider: QueryProviderService
  ) {}

  ngOnInit() {
    this.referenceChecked = this.criterion.linkedCriteria.length > 0 ? true : false;
    this.createCriterionFromSingleReference();
    this.displayExistingReferenceCriterions();
  }

  createCriterionFromSingleReference() {
    this.referenceAttributes.forEach((reference) => {
      const referenceAttributeDefinition = reference.attributeDefinition;
      if (referenceAttributeDefinition.referenceOnlyOnce) {
        this.createCriterionFromReferenceTermcode(
          referenceAttributeDefinition.singleReference.termCodes,
          referenceAttributeDefinition.singleReference.context
        );
      }
    });
  }

  createCriterionFromReferenceTermcode(
    termCodes: Array<TerminologyCode>,
    context: TerminologyCode
  ): void {
    this.createCriterionService
      .createCriterionFromTermCode(termCodes, context)
      .subscribe((refernceCriterion) => {
        this.singleReferenceCriterion = refernceCriterion;
        this.singleReferenceCriterion.termCodes[0] = termCodes[0];
        this.referenceCriterions.push(this.singleReferenceCriterion);
      });
  }

  displayExistingReferenceCriterions(): void {
    this.criterion.attributeFilters.forEach((attributeFilter) => {
      const selectableConcepts: Array<TerminologyCode> =
        attributeFilter.attributeDefinition.selectableConcepts;
      if (attributeFilter.type === FilterTypes.REFERENCE && selectableConcepts.length > 0) {
        this.findReferenceCriterionInMap(selectableConcepts);
      }
    });
  }

  findReferenceCriterionInMap(selectableConcepts: TerminologyCode[]): void {
    const uniqueIDs = this.createMapOfCriterions();
    selectableConcepts.forEach((termCode) => {
      if (uniqueIDs.has(termCode.uid)) {
        const refernceCriterion: Criterion = uniqueIDs.get(termCode.uid);
        this.referenceCriterions.push(refernceCriterion);
      }
    });
  }

  createMapOfCriterions(): Map<string, Criterion> {
    const uniqueIDsMap = new Map<string, Criterion>();
    for (const inex of ['inclusion', 'exclusion']) {
      this.query.groups[0][inex + 'Criteria'].forEach((andGroup) => {
        andGroup.forEach((criterion) => {
          uniqueIDsMap.set(criterion.uniqueID, criterion);
        });
      });
    }
    return uniqueIDsMap;
  }

  selectCheckboxForReference(): void {
    if (this.referenceChecked) {
      this.setReference();
    } else {
      this.deleteLinkedCriterion();
    }
  }

  setReference() {
    this.singleReferenceCriterion.isLinked = true;
    this.singleReferenceCriterion.position = new CritGroupPosition();
    this.singleReferenceCriterion.entity = true;
    this.criterion.linkedCriteria.push(this.singleReferenceCriterion);
    this.setSelectableConceptsForCriterion(this.singleReferenceCriterion.termCodes[0]);
  }

  setSelectableConceptsForCriterion(referenceAttributeTermCode: TerminologyCode) {
    this.criterion.attributeFilters.forEach((attribureFilter) => {
      const attributeDefinition = attribureFilter.attributeDefinition;
      if (
        attributeDefinition.type === FilterTypes.REFERENCE &&
        attributeDefinition.referenceOnlyOnce
      ) {
        attributeDefinition.selectableConcepts.push(referenceAttributeTermCode);
      }
    });
    this.moveReferenceCriteria();
  }

  deleteLinkedCriterion() {
    this.criterion.linkedCriteria.forEach((linkedCriteria) => {
      linkedCriteria.isLinked = false;
      this.query.groups[0].inclusionCriteria.push([linkedCriteria]);
    });
    this.criterion.linkedCriteria = [];
    this.provider.store(this.query);
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
