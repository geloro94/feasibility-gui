import { Injectable } from '@angular/core';
import { TerminologyCode, TerminologyEntry } from '../model/terminology/terminology';
import { Criterion } from '../model/query/criterion';
import { TimeRestriction } from '../model/query/timeRestriction';
import { AttributeFilter } from '../model/query/attributeFilter';
import { ValueFilter } from '../model/query/valueFilter';
import { BackendService } from '../modules/querybuilder/service/backend.service';
import { v3 as uuidv3 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import { FeatureService } from './feature.service';
@Injectable({
  providedIn: 'root',
})
export class TermEntry2CriterionTranslatorService {
  private useFeatureTimeRestrictions = false;

  private termEntry: TerminologyEntry;

  criterion: Criterion;

  attributeFilters: AttributeFilter[];

  valueFilters: ValueFilter[];

  constructor(private featureService: FeatureService) {
    this.useFeatureTimeRestrictions = this.featureService.useFeatureTimeRestriction();
    this.criterion = new Criterion();
    this.attributeFilters = new Array<AttributeFilter>();
    this.valueFilters = new Array<ValueFilter>();
    this.translate();
  }

  public getCriterion(termEntry: TerminologyEntry): Criterion {
    this.termEntry = termEntry;
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
