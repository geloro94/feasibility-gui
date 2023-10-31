import { Injectable } from '@angular/core';
import { TerminologyEntry } from '../model/terminology/terminology';
import { Criterion } from '../model/query/Criterion/criterion';
import { TimeRestriction } from '../model/query/timeRestriction';
import { AttributeFilter } from '../model/query/Criterion/attributeFilter';
import { ValueFilter } from '../model/query/Criterion/valueFilter';
import { BackendService } from '../modules/querybuilder/service/backend.service';
import { v3 as uuidv3 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import { FeatureService } from './feature.service';
import { LoadUIProfilesService } from './LoadUIProfilesService';
@Injectable({
  providedIn: 'root',
})
export class TermEntry2CriterionTranslatorService {
  private useFeatureTimeRestrictions = false;

  private termEntry: TerminologyEntry;

  private loadUiProfileService: LoadUIProfilesService;

  criterion: Criterion;

  attributeFilters: AttributeFilter[];

  valueFilters: ValueFilter[];

  /**
   *
   * LoadUiProfiles need to be define further and created as a separate dat model
   * Further anaylize of the backend ist needed
   */
  constructor(private featureService: FeatureService) {
    this.useFeatureTimeRestrictions = this.featureService.useFeatureTimeRestriction();

    this.criterion = new Criterion();
    this.attributeFilters = new Array<AttributeFilter>();
    this.valueFilters = new Array<ValueFilter>();
  }

  public getCriterion(termEntry: TerminologyEntry): Criterion {
    this.termEntry = termEntry;
    this.translate();
    return this.criterion;
  }

  private translate(): Criterion {
    this.criterion.timeRestriction = this.createTimeRestriction();
    this.criterion.attributeFilters = this.attributeFilters;
    this.criterion.valueFilters = this.valueFilters;
    this.criterion.context = this.termEntry.context;
    this.termEntry.termCodes?.forEach((termCode) => {
      this.criterion.termCodes.push(termCode);
    });
    this.criterion.display = this.termEntry.display;
    this.criterion.entity = this.termEntry.entity;
    this.criterion.children = this.termEntry.children;
    this.criterion.optional = this.termEntry.optional;
    this.criterion.criterionHash = this.getCriterionHash();
    if (!this.criterion.uniqueID) {
      this.criterion.uniqueID = uuidv4();
    }
    return this.criterion;
  }

  private setUiProfiles() {
    const uiProfiles = this.loadUiProfileService
      .getUIProfiles(this.criterion)
      .subscribe((profile) => {});
  }

  private getCriterionHash(): string {
    const termCode = this.criterion.termCodes[0];
    const context = this.criterion.context;

    const contextVersion = context.version ? context.version : '';
    const termcodeVersion = termCode.version ? termCode.version : '';

    const contextTermcodeHashInput =
      context.system +
      context.code +
      contextVersion +
      termCode.system +
      termCode.code +
      termcodeVersion;
    return uuidv3(contextTermcodeHashInput, BackendService.BACKEND_UUID_NAMESPACE);
  }

  private createTimeRestriction(): TimeRestriction {
    return this.termEntry.timeRestrictionAllowed && this.useFeatureTimeRestrictions
      ? new TimeRestriction()
      : undefined;
  }
}
