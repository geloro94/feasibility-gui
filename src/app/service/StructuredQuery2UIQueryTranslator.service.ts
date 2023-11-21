import { Injectable } from '@angular/core';
import { StructuredQuery } from '../model/StructuredQuery/StructuredQuery';
import { Query } from '../model/FeasibilityQuery/Query';
import { StructuredQueryTemplate } from '../model/StructuredQuery/StructuredQueryTemplate';
import { Criterion } from '../model/FeasibilityQuery/Criterion/Criterion';
import { TerminologyCode } from '../model/terminology/Terminology';
import { StructuredQueryCriterion } from '../model/StructuredQuery/CriterionSQ/StructuredQueryCriterion';
import { TimeRestriction } from '../model/FeasibilityQuery/TimeRestriction';
import { AbstractTimeRestriction } from '../model/StructuredQuery/CriterionSQ/TimeRestriction/AbstractTimeRestriction';
import { ValueFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';
import { AttributeFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';

@Injectable({
  providedIn: 'root',
})
export class StructuredQuery2UIQueryTranslator {
  constructor() {}

  public translateImportedSQtoUIQuery(uiquery: Query, sqquery: StructuredQuery): Query {
    const invalidCriteria = [];
    const inclusion = sqquery.inclusionCriteria ? sqquery.inclusionCriteria : [];
    uiquery.groups[0].inclusionCriteria = this.translateSQtoUICriteria(inclusion, invalidCriteria);
    const exclusion = sqquery.exclusionCriteria ? sqquery.exclusionCriteria : [];
    uiquery.groups[0].exclusionCriteria = this.translateSQtoUICriteria(exclusion, invalidCriteria);
    uiquery.consent = this.hasConsentAndIfSoDeleteIt(sqquery);
    //uiquery = this.rePosition(uiquery);
    return uiquery;
  }

  public translateSQtoUIQuery(uiquery: Query, sqquery: StructuredQueryTemplate): Query {
    const invalidCriteria = sqquery.invalidTerms;
    const inclusion = sqquery.content.inclusionCriteria ? sqquery.content.inclusionCriteria : [];
    uiquery.groups[0].inclusionCriteria = this.translateSQtoUICriteria(inclusion, invalidCriteria);
    const exclusion = sqquery.content.exclusionCriteria ? sqquery.content.exclusionCriteria : [];
    uiquery.groups[0].exclusionCriteria = this.translateSQtoUICriteria(exclusion, invalidCriteria);
    uiquery.consent = this.hasConsentAndIfSoDeleteIt(sqquery.content);
    //uiquery = this.rePosition(uiquery);
    return uiquery;
  }

  private translateSQtoUICriteria(
    inexclusion: StructuredQueryCriterion[][],
    invalidCriteria: TerminologyCode[]
  ): Criterion[][] {
    const invalidCriteriaSet = this.getInvalidCriteriaSet(invalidCriteria);
    const resultInexclusion: Criterion[][] = [];
    inexclusion.forEach((structuredCriterionArray) => {
      structuredCriterionArray.forEach((structuredCriterion) => {
        const criterionArray: Criterion[] = [];
        criterionArray.push(this.assignStructuredCriterionToCriterion(structuredCriterion));
      });
    });
  }

  private getInvalidCriteriaSet(invalidCriteria: TerminologyCode[]): Set<string> {
    const invalidCriteriaSet: Set<string> = new Set();
    invalidCriteria.forEach((invalids) => {
      invalidCriteriaSet.add(JSON.stringify(invalids));
    });
    return invalidCriteriaSet;
  }

  private assignStructuredCriterionToCriterion(
    structuredCriterion: StructuredQueryCriterion
  ): Criterion {
    const criterion = new Criterion();
    criterion.attributeFilters = this.addAttributeFilters(structuredCriterion);
    criterion.display = structuredCriterion.termCodes[0].display;
    criterion.termCodes = structuredCriterion.termCodes;
    criterion.context = structuredCriterion.context;
    criterion.timeRestriction = this.addTimeRestriction(structuredCriterion.timeRestriction);
    criterion.valueFilters = this.addValueFilters(structuredCriterion);
    return criterion;
  }

  private addAttributeFilters(structuredCriterion: StructuredQueryCriterion): AttributeFilter[] {
    const attributeFilters: AttributeFilter[] = [];
    structuredCriterion.attributeFilters.forEach((attributeFilter) => {
      //attributeFilters.push(attributeFilter)
    });
    return attributeFilters;
  }

  private addValueFilters(structuredCriterion: StructuredQueryCriterion): ValueFilter[] {
    const valueFilters: ValueFilter[] = [];
    return valueFilters;
  }

  private addTimeRestriction(timeRestriction: AbstractTimeRestriction): TimeRestriction {
    const resultTimeRestriction = new TimeRestriction();
    return resultTimeRestriction;
  }
}
