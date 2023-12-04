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
import { FilterTypesService } from './FilterTypes.service';
import { ConceptValueFilter } from '../model/StructuredQuery/Criterion/ConceptFilter/ConceptValueFilter';
import { CreateCriterionService } from './CriterionService/CreateCriterion.service';
import { QuantityRangeFilter } from '../model/StructuredQuery/Criterion/QuantityFilter/QuantityRangeFilter';
import { StructuredQueryAttributeFilters } from '../model/StructuredQuery/StructuredQueryAttributeFilters';
import { QuantityComparatorFilter } from '../model/StructuredQuery/Criterion/QuantityFilter/QuantityComparatorFilter';

@Injectable({
  providedIn: 'root',
})
export class StructuredQuery2UIQueryTranslatorService {
  constructor(
    private filter: FilterTypesService,
    private createCriterionService: CreateCriterionService
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
    const resultInExclusion: Criterion[][] = [];
    inexclusion.forEach((structuredQueryCriterionArray) => {
      structuredQueryCriterionArray.forEach((structuredQueryCriterion) => {
        const criterionArray: Criterion[] = [];
        criterionArray.push(
          this.createCriterionFromStructuredQueryCriterion(structuredQueryCriterion)
        );
      });
    });
    return resultInExclusion;
  }

  /**
   * @todo Work in progress
   */
  private getInvalidCriteriaSet(invalidCriteria: TerminologyCode[]): Set<string> {
    const invalidCriteriaSet: Set<string> = new Set();
    invalidCriteria.forEach((invalids) => {
      invalidCriteriaSet.add(JSON.stringify(invalids));
    });
    return invalidCriteriaSet;
  }

  /**
   * @param structuredCriterion
   * @todo create function to concatinate criterions attributeFilter and valueFilter created from termCode and UI Profile
   * with the attributeFilter and Valuefilter from the SQ
   * e.g concatAttributeFilters(criterion.attributeFilters, addAttributeFilters())
   */
  private createCriterionFromStructuredQueryCriterion(
    structuredQueryCriterion: StructuredQueryCriterion
  ): Criterion {
    const criterion: Criterion = this.createCriterionService.createCriterionFromTermCode(
      structuredQueryCriterion.termCodes,
      structuredQueryCriterion.context
    );
    criterion.attributeFilters = [
      ...this.getAttributeFilters(structuredQueryCriterion),
      ...criterion.attributeFilters,
    ];
    criterion.timeRestriction = this.addTimeRestriction(structuredQueryCriterion.timeRestriction);
    criterion.valueFilters = this.addValueFilters(structuredQueryCriterion);
    return criterion;
  }

  /**
   * @todo need to add the references
   */
  private getAttributeFilters(structuredCriterion: StructuredQueryCriterion): AttributeFilter[] {
    const attributeFilters: AttributeFilter[] = [];
    structuredCriterion.attributeFilters.forEach((structuredQueryAttributeFilter) => {
      const attributeFilter = this.createAttributeFilter(structuredQueryAttributeFilter);
      attributeFilters.push(attributeFilter);
    });
    return attributeFilters;
  }

  private createAttributeFilter(structuredQueryAttributeFilter: StructuredQueryAttributeFilters) {
    const attributeFilter: AttributeFilter = new AttributeFilter();
    attributeFilter.attributeCode = structuredQueryAttributeFilter.attributeCode;
    attributeFilter.selectedConcepts = structuredQueryAttributeFilter.selectedConcepts;
    return attributeFilter;
  }

  /**
   * @todo We keep ValueFilters as an Array despite being only one element inside the array
   * @todo we need to test if the declaration with 'as' is assigning all requiered fields
   * @param structuredCriterion
   * @returns
   */
  private addValueFilters(structuredCriterion: StructuredQueryCriterion): ValueFilter[] {
    const valueFiltersResult: ValueFilter[] = [];
    if (structuredCriterion.valueFilters?.length > 0) {
      structuredCriterion.valueFilters.forEach((valueFilter) => {
        if (this.filter.isConcept(valueFilter.type)) {
          const conceptValueFilter: ConceptValueFilter = valueFilter as ConceptValueFilter;
          valueFiltersResult.map((valueFilterResult) => {
            valueFilterResult.selectedConcepts = conceptValueFilter.selectedConcepts;
          });
        }
        if (this.filter.isQuantityComparator(valueFilter.type)) {
          const valueFilterQuantityComparator = valueFilter as QuantityComparatorFilter;
          valueFiltersResult.map((valueFilterResult) => {
            valueFilterResult.type = valueFilter.type;
            valueFilterResult.value = valueFilterQuantityComparator.value;
            valueFilterResult.unit = valueFilterQuantityComparator.unit;
            valueFilterResult.comparator = valueFilterQuantityComparator.comparator;
          });
        }
        if (this.filter.isQuantityRange(valueFilter.type)) {
          const valueFilterQuantityRange = valueFilter as QuantityRangeFilter;
          valueFiltersResult.map((valueFilterResult) => {
            valueFilterResult.type = valueFilter.type;
            valueFilterResult.max = valueFilterQuantityRange.maxValue;
            valueFilterResult.min = valueFilterQuantityRange.minValue;
          });
        }
      });
    }
    return valueFiltersResult;
  }

  private addTimeRestriction(timeRestriction: AbstractTimeRestriction): TimeRestriction {
    const resultTimeRestriction = new TimeRestriction();
    return resultTimeRestriction;
  }
}
