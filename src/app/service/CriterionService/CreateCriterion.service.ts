import { Criterion } from 'src/app/model/FeasibilityQuery/Criterion/Criterion';
import { CriterionHashService } from './CriterionHash.service';
import { Injectable } from '@angular/core';
import { TerminologyCode, TerminologyEntry } from 'src/app/model/terminology/Terminology';
import { v4 as uuidv4 } from 'uuid';
import { UIProfile } from 'src/app/model/terminology/UIProfile';
import {
  AttributeDefinition,
  ValueDefinition,
} from 'src/app/model/terminology/AttributeDefinitions/AttributeDefinition';
import { ValueFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';
import { AttributeFilter } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { TimeRestriction } from 'src/app/model/FeasibilityQuery/TimeRestriction';
import { FeatureService } from '../Feature.service';
import { LoadUIProfileService } from '../LoadUIProfile.service';

@Injectable({
  providedIn: 'root',
})
export class CreateCriterionService {
  constructor(
    private criterionHashService: CriterionHashService,
    private featureService: FeatureService,
    private UiProfileService: LoadUIProfileService
  ) {}

  public createCriterionFromTermCode(
    termCodes: TerminologyCode[],
    context: TerminologyCode
  ): Criterion {
    const criterion: Criterion = new Criterion();
    criterion.context = context;
    criterion.criterionHash = this.criterionHashService.createHash(context, termCodes[0]);
    criterion.display = termCodes[0].display;
    criterion.termCodes = this.copyTermCodes(termCodes);
    criterion.uniqueID = uuidv4();
    return Object.assign(criterion, this.applyUIProfileToCriterion(criterion.criterionHash));
  }

  public createCriterionFromTermEntry(termEntry: TerminologyEntry): Criterion {
    const criterion: Criterion = new Criterion();
    criterion.children = termEntry.children;
    criterion.context = termEntry.context;
    criterion.display = termEntry.display;
    criterion.entity = termEntry.entity;
    criterion.optional = termEntry.optional;
    criterion.termCodes = this.copyTermCodes(termEntry.termCodes);
    criterion.uniqueID = uuidv4();
    criterion.criterionHash = this.criterionHashService.createHash(
      criterion.context,
      criterion.termCodes[0]
    );
    return criterion;
  }

  private copyTermCodes(termCodes: TerminologyCode[]): TerminologyCode[] {
    const termCodeResult = new Array<TerminologyCode>();
    termCodes.forEach((termCode) => {
      termCodeResult.push(termCode);
    });
    return termCodeResult;
  }

  private applyUIProfileToCriterion(hash: string): void {
    this.UiProfileService.getUIProfile(hash).subscribe((profile) => {
      this.addUIProfileElementsToCriterion(profile);
    });
  }

  private addUIProfileElementsToCriterion(profile: UIProfile): Criterion {
    const criterion: Criterion = new Criterion();
    criterion.attributeFilters = this.getAttributeFilters(profile.attributeDefinitions);
    criterion.valueFilters[0] = this.getValueFilters(profile.valueDefinition);
    criterion.timeRestriction = this.addTimeRestriction(profile.timeRestrictionAllowed);
    return criterion;
  }

  private getValueFilters(valueDefinition: ValueDefinition): ValueFilter {
    const valueFilter = new ValueFilter();
    valueFilter.maxValue = valueDefinition.max;
    valueFilter.minValue = valueDefinition.min;
    valueFilter.precision = valueDefinition.precision;
    valueFilter.optional = valueDefinition.optional;
    valueFilter.type = this.UiProfileService.setDefinitionType(valueDefinition.type);
    valueFilter.valueDefinition = this.UiProfileService.extractValueDefinition(valueDefinition);
    return valueFilter;
  }

  private getAttributeFilters(attributeDefinitions: AttributeDefinition[]): AttributeFilter[] {
    const attributeFilter = this.UiProfileService.extractAttributeFilters(attributeDefinitions);
    return attributeFilter;
  }

  private addTimeRestriction(timeRestrictionAllowed: boolean): TimeRestriction | undefined {
    const useFeatureTimeRestrictions = this.featureService.useFeatureTimeRestriction();
    return timeRestrictionAllowed && useFeatureTimeRestrictions ? new TimeRestriction() : undefined;
  }
}
