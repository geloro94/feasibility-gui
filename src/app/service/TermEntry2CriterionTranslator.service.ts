import { Injectable } from '@angular/core';
import { TerminologyCode, TerminologyEntry } from '../model/terminology/Terminology';
import { Criterion } from '../model/query/Criterion/Criterion';
import { TimeRestriction } from '../model/query/TimeRestriction';
import { BackendService } from '../modules/querybuilder/service/backend.service';
import { v3 as uuidv3 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import { FeatureService } from './feature.service';
import { LoadUIProfileService } from './LoadUIProfileService';
import { UIProfile } from '../model/terminology/UIProfile';
import { ValueDefinition } from '../model/terminology/AttributeDefinitions/AttributeDefinition';
import { AttributeDefinition } from '../modules/querybuilder/model/api/terminology/valuedefinition';
@Injectable({
  providedIn: 'root',
})
export class TermEntry2CriterionTranslatorService {
  private useFeatureTimeRestrictions = false;

  private termEntry: TerminologyEntry;

  private UiProfileService: LoadUIProfileService;

  criterion: Criterion;

  constructor(private featureService: FeatureService) {
    this.useFeatureTimeRestrictions = this.featureService.useFeatureTimeRestriction();
    this.criterion = new Criterion();
  }

  public getCriterion(termEntry: TerminologyEntry): Criterion {
    this.termEntry = termEntry;
    this.createCriterion();
    return this.criterion;
  }

  private createCriterion() {
    this.createCriterionFromTermEntry();
    this.extendCriterionFromUIProfile();
  }

  private createCriterionFromTermEntry() {
    this.criterion.display = this.termEntry.display;
    this.criterion.entity = this.termEntry.entity;
    this.criterion.children = this.termEntry.children;
    this.criterion.optional = this.termEntry.optional;
    this.criterion.context = this.termEntry.context;
    this.termEntry.termCodes?.forEach((termCode) => {
      this.criterion.termCodes.push(termCode);
    });
    this.criterion.criterionHash = this.createCriterionHash();
    if (!this.criterion.uniqueID) {
      this.criterion.uniqueID = uuidv4();
    }
  }

  private createCriterionHash(): string {
    const termCode = this.criterion.termCodes[0];
    const context = this.criterion.context;
    const contextTermcodeHash = this.concatContextTermCode(context, termCode);
    return uuidv3(contextTermcodeHash, BackendService.BACKEND_UUID_NAMESPACE);
  }

  private concatContextTermCode(context: TerminologyCode, termCode: TerminologyCode): string {
    const contextVersion = context.version ? context.version : '';
    const termcodeVersion = termCode.version ? termCode.version : '';
    const contextTermcodeHashInput =
      context.system +
      context.code +
      contextVersion +
      termCode.system +
      termCode.code +
      termcodeVersion;
    return contextTermcodeHashInput;
  }

  private extendCriterionFromUIProfile() {
    this.UiProfileService.getUIProfile(this.criterion).subscribe((profile) => {
      this.addUIProfileElementsToCriterion(profile);
    });
  }

  private addUIProfileElementsToCriterion(profile: UIProfile): void {
    this.addValueFilters(profile.valueDefinition);
    this.addAttributeFilters(profile.attributeDefinitions);
    this.addTimeRestriction();
  }

  private addValueFilters(valueDefinition: ValueDefinition): void {
    const valueFilter = this.criterion.valueFilters[0];
    valueFilter.valueDefinition = this.UiProfileService.getValueDefinition(valueDefinition);
    valueFilter.precision = valueDefinition.precision;
    this.criterion.valueFilters[0] = valueFilter;
  }

  private addAttributeFilters(attributeDefinitions: AttributeDefinition[]): void {
    this.criterion.attributeFilters =
      this.UiProfileService.getAttributeFilters(attributeDefinitions);
  }

  private addTimeRestriction(): void {
    this.criterion.timeRestriction =
      this.termEntry.timeRestrictionAllowed && this.useFeatureTimeRestrictions
        ? new TimeRestriction()
        : undefined;
  }
}
