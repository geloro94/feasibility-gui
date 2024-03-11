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
import { LoadUIProfileService } from 'src/app/service/LoadUIProfile.service';
import { TermEntry2CriterionTranslatorService } from 'src/app/service/TermEntry2CriterionTranslator.service';

@Component({
  selector: 'num-edit-reference',
  templateUrl: './edit-reference.component.html',
  styleUrls: ['./edit-reference.component.scss'],
})
export class EditReferenceComponent implements OnInit {
  @Input()
  criterion: Criterion;

  @Input()
  query: Query;

  referenceChecked = false;

  criterionAttributeFilterReference: Criterion[] = [];

  constructor(
    private termEntryService: TermEntry2CriterionTranslatorService,
    private loadUIProfileService: LoadUIProfileService,
    public provider: QueryProviderService
  ) {}

  ngOnInit() {
    this.getCriterionHashesOfReference();
  }

  getCriterionHashesOfReference() {
    this.loadUIProfileService.getUIProfile(this.criterion.criterionHash).subscribe((uiProfile) => {
      this.loadUiProfilesForCriterion(uiProfile);
    });
  }

  loadUiProfilesForCriterion(uiProfile: UIProfile) {
    const attributeFilters: Array<AttributeFilter> =
      this.loadUIProfileService.extractAttributeFilters(uiProfile.attributeDefinitions);
    attributeFilters.forEach((attributeFilter) => {
      if (attributeFilter.attributeDefinition.referenceOnlyOnce === true) {
        this.getReferenceAttributes(attributeFilter.attributeDefinition.singleReference);
      }
    });
  }

  getReferenceAttributes(termcode: TerminologyEntry) {
    const referenceCriterion = this.termEntryService.translateTermEntry(termcode);
    this.criterionAttributeFilterReference.push(referenceCriterion);
  }

  selectCheckboxForReference() {
    if (this.referenceChecked) {
      this.criterionAttributeFilterReference[0].position = new CritGroupPosition();
      this.criterion.linkedCriteria.push(this.criterionAttributeFilterReference[0]);
      this.query.groups[0].inclusionCriteria.push([this.criterionAttributeFilterReference[0]]);
      this.criterion.isLinked = true;
      this.criterion.position = new CritGroupPosition();
      this.setSelectableConceptsForCriterion();
    }
  }

  setSelectableConceptsForCriterion() {
    this.criterion.attributeFilters.forEach((attribureFilter) => {
      const attributeDefinition = attribureFilter.attributeDefinition;
      if (attributeDefinition.type === FilterTypes.REFERENCE) {
        const referenceTermCode: TerminologyCode =
          this.criterionAttributeFilterReference[0].termCodes[0];
        attribureFilter.attributeDefinition.selectableConcepts.push(referenceTermCode);
        this.query.groups[0].inclusionCriteria.push([this.criterion]);
        this.moveReferenceCriteria();
        this.provider.store(this.query);
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
