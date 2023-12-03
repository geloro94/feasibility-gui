import { Injectable } from '@angular/core';
import { StructuredQuery } from '../model/StructuredQuery/StructuredQuery';
import { Query } from '../model/FeasibilityQuery/Query';
import { StructuredQueryTemplate } from '../model/StructuredQuery/StructuredQueryTemplate';
import { Criterion } from '../model/FeasibilityQuery/Criterion/Criterion';
import { TerminologyCode } from '../model/terminology/Terminology';
import { TimeRestriction } from '../model/FeasibilityQuery/TimeRestriction';
import { ValueFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';
import { AttributeFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { StructuredQueryCriterion } from '../model/StructuredQuery/Criterion/StructuredQueryCriterion';
import { AbstractTimeRestriction } from '../model/StructuredQuery/Criterion/TimeRestriction/AbstractTimeRestriction';
import { FilterTypes } from '../model/FilterTypes';
import { FilterTypesService } from './FilterTypes.service';
import { ConceptValueFilter } from '../model/StructuredQuery/Criterion/ConceptFilter/ConceptValueFilter';
import { AbstractConceptFilter } from '../model/StructuredQuery/Criterion/ConceptFilter/AbstractConceptFilter';
import { TermEntry2CriterionTranslatorService } from './TermEntry2CriterionTranslator.service';
import { CriterionHashService } from './CriterionService/CriterionHash.service';

@Injectable({
  providedIn: 'root',
})
export class StructuredQuery2UIQueryTranslatorService {
  constructor(
    private filter: FilterTypesService,
    private criterionHashService: CriterionHashService,
    private termEntryService: TermEntry2CriterionTranslatorService
  ) {}

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
    return resultInexclusion;
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
    criterion.criterionHash = this.criterionHashService.createHash(
      criterion.context,
      criterion.termCodes[0]
    );
    return criterion;
  }

  private addAttributeFilters(structuredCriterion: StructuredQueryCriterion): AttributeFilter[] {
    const attributeFilters: AttributeFilter[] = [];
    structuredCriterion.attributeFilters.forEach((attributeFilter) => {
      //attributeFilters.push(attributeFilter)
    });
    return attributeFilters;
  }

  /**
   * @todo We keep ValueFilters as an Array despite being only one element inside the array
   * @todo we need to test if the declaration with 'as' is assigning all requiered fields
   * @param structuredCriterion
   * @returns
   */
  private addValueFilters(structuredCriterion: StructuredQueryCriterion): ValueFilter[] {
    const valueFilters: ValueFilter[] = [];
    if (structuredCriterion.valueFilters?.length > 0) {
      structuredCriterion.valueFilters.forEach((valueFilter) => {
        if (this.filter.isConcept(valueFilter.type)) {
          const conceptValueFilter: ConceptValueFilter = valueFilter as AbstractConceptFilter;
          conceptValueFilter.type = FilterTypes.CONCEPT;
        }
      });
    }
    return valueFilters;
  }

  private addTimeRestriction(timeRestriction: AbstractTimeRestriction): TimeRestriction {
    const resultTimeRestriction = new TimeRestriction();
    return resultTimeRestriction;
  }
}
