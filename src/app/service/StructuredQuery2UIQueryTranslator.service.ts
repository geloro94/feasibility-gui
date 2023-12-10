import { AbstractAttributeFilters } from '../model/FeasibilityQuery/Criterion/AttributeFilter/AbstractAttributeFilters';
import { AbstractStructuredQueryFilters } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/AbstractStructuredQueryFilters';
import { AbstractTimeRestriction } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/TimeRestriction/AbstractTimeRestriction';
import { AttributeFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { ConceptAttributeFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/ConceptFilter/ConceptAttributeFilter';
import { ConceptValueFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/ConceptFilter/ConceptValueFilter';
import { CreateCriterionService } from './CriterionService/CreateCriterion.service';
import { Criterion } from '../model/FeasibilityQuery/Criterion/Criterion';
import { FilterTypes } from '../model/FilterTypes';
import { FilterTypesService } from './FilterTypes.service';
import { Injectable } from '@angular/core';
import { Query } from '../model/FeasibilityQuery/Query';
import { ReferenceFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/ReferenceFilter/ReferenceFilter';
import { StructuredQuery } from '../model/StructuredQuery/StructuredQuery';
import { StructuredQueryCriterion } from '../model/StructuredQuery/Criterion/StructuredQueryCriterion';
import { StructuredQueryTemplate } from '../model/StructuredQuery/StructuredQueryTemplate';
import { TerminologyCode } from '../model/terminology/Terminology';
import { TimeRestriction } from '../model/FeasibilityQuery/TimeRestriction';
import { ValueFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';

@Injectable({
  providedIn: 'root',
})
export class StructuredQuery2UIQueryTranslatorService {
  constructor(private filter: FilterTypesService, private createCriterionService: CreateCriterionService) {}

  public translateImportedSQtoUIQuery(uiquery: Query, sqquery: StructuredQuery): Query {
    const invalidCriteria = [];
    const inclusion = sqquery.inclusionCriteria;
    uiquery.groups[0].inclusionCriteria = this.translateSQtoUICriteria(inclusion, invalidCriteria);
    const exclusion = sqquery.exclusionCriteria;
    uiquery.groups[0].exclusionCriteria = this.translateSQtoUICriteria(exclusion, invalidCriteria);
    //uiquery.consent = this.hasConsentAndIfSoDeleteIt(sqquery);
    //uiquery = this.rePosition(uiquery);
    return uiquery;
  }

  public translateSQtoUIQuery(uiquery: Query, sqquery: StructuredQueryTemplate): Query {
    const invalidCriteria = sqquery.invalidTerms;
    const inclusion = sqquery.content.inclusionCriteria;
    uiquery.groups[0].inclusionCriteria = this.translateSQtoUICriteria(inclusion, invalidCriteria);
    const exclusion = sqquery.content.exclusionCriteria;
    uiquery.groups[0].exclusionCriteria = this.translateSQtoUICriteria(exclusion, invalidCriteria);
    //uiquery.consent = this.hasConsentAndIfSoDeleteIt(sqquery.content);
    //uiquery = this.rePosition(uiquery);
    return uiquery;
  }

  private translateSQtoUICriteria(inexclusion: StructuredQueryCriterion[][], invalidCriteria: TerminologyCode[]): Criterion[][] {
    const invalidCriteriaSet = this.getInvalidCriteriaSet(invalidCriteria);
    const resultInExclusion: Criterion[][] = [];
    inexclusion.forEach((structuredQueryCriterionArray) => {
      const criterionArray: Criterion[] = [];
      structuredQueryCriterionArray.forEach((structuredQueryCriterion) => {
        const criterion: Criterion = this.createCriterionFromStructuredQueryCriterion(structuredQueryCriterion);
        criterionArray.push(criterion);
        if (criterion.linkedCriteria.length > 0) {
          resultInExclusion.push(criterion.linkedCriteria);
        }
      });
      resultInExclusion.push(criterionArray);
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

  private createCriterionFromStructuredQueryCriterion(structuredQueryCriterion: StructuredQueryCriterion): Criterion {
    const criterion: Criterion = this.createCriterionService.createCriterionFromTermCode(structuredQueryCriterion.termCodes, structuredQueryCriterion.context);
    criterion.attributeFilters = [...this.getAttributeFilters(structuredQueryCriterion, criterion), ...criterion.attributeFilters];
    criterion.timeRestriction = this.addTimeRestriction(structuredQueryCriterion.timeRestriction);
    criterion.valueFilters = this.getValueFilters(structuredQueryCriterion);

    return criterion;
  }

  private getAttributeFilters(structuredCriterion: StructuredQueryCriterion, criterion: Criterion): AttributeFilter[] {
    const attributeFilters: AttributeFilter[] = [];
    structuredCriterion.attributeFilters.forEach((structuredQueryAttributeFilter) => {
      const attributeFilter: AttributeFilter = this.createAttributeFilter(structuredQueryAttributeFilter, criterion) as AttributeFilter;
      attributeFilters.push(attributeFilter);
    });
    return attributeFilters;
  }

  private createAttributeFilter(structuredQueryAttributeFilter: AbstractStructuredQueryFilters, criterion: Criterion) {
    const attributeFilter: AttributeFilter = new AttributeFilter();
    if (this.filter.isConcept(structuredQueryAttributeFilter.type)) {
      const conceptFilter = structuredQueryAttributeFilter as ConceptAttributeFilter;
      attributeFilter.attributeCode = conceptFilter.attributeCode;
      attributeFilter.type = FilterTypes.CONCEPT;
      attributeFilter.selectedConcepts = conceptFilter.selectedConcepts;
    }
    if (this.filter.isQuantityComparator(structuredQueryAttributeFilter.type)) {
      return this.createQuantityComparatorFilter(structuredQueryAttributeFilter, attributeFilter);
    }
    if (this.filter.isQuantityRange(structuredQueryAttributeFilter.type)) {
      return this.createQuantityRangeFilter(structuredQueryAttributeFilter, attributeFilter) as AttributeFilter;
    }
    if (this.filter.isReference(structuredQueryAttributeFilter.type)) {
      const referenceFilter = structuredQueryAttributeFilter as ReferenceFilter;
      attributeFilter.type = FilterTypes.REFERENCE;
      referenceFilter.criteria.map((structuredQueryCriterion) => {
        criterion.linkedCriteria.push(this.createCriterionFromStructuredQueryCriterion(structuredQueryCriterion));
      });
    }
    return attributeFilter;
  }

  private createQuantityComparatorFilter(structuredQueryAttributeFilter, abstractFilter: AbstractAttributeFilters): AbstractAttributeFilters {
    abstractFilter.type = FilterTypes.QUANTITY_COMPARATOR;
    abstractFilter.comparator = structuredQueryAttributeFilter.quantityComparatorFilter.comparator;
    abstractFilter.unit = structuredQueryAttributeFilter.quantityComparatorFilter.unit;
    abstractFilter.value = structuredQueryAttributeFilter.quantityComparatorFilter.value;
    return abstractFilter;
  }

  private createQuantityRangeFilter(structuredQueryAttributeFilter, abstractFilter: AbstractAttributeFilters): AbstractAttributeFilters {
    abstractFilter.type = FilterTypes.QUANTITY_RANGE;
    abstractFilter.max = structuredQueryAttributeFilter.quantityRangeFilter.maxValue;
    abstractFilter.min = structuredQueryAttributeFilter.quantityRangeFilter.minValue;
    abstractFilter.unit = structuredQueryAttributeFilter.quantityRangeFilter.unit;
    return abstractFilter;
  }
  /**
   * @todo We keep ValueFilters as an Array despite being only one element inside the array
   * @todo we need to test if the declaration with 'as' is assigning all requiered fields
   * @param structuredCriterion
   * @returns
   */
  private getValueFilters(structuredCriterion: StructuredQueryCriterion): ValueFilter[] {
    const valueFiltersResult: ValueFilter[] = [];
    valueFiltersResult.push(this.createValueFilter(structuredCriterion.valueFilter));
    return valueFiltersResult;
  }

  private createValueFilter(structuredQueryValueFilter: AbstractStructuredQueryFilters): ValueFilter {
    const valueFilterResult: ValueFilter = new ValueFilter();
    if (this.filter.isConcept(structuredQueryValueFilter.type)) {
      const conceptFilter = structuredQueryValueFilter as ConceptValueFilter;
      valueFilterResult.type = FilterTypes.CONCEPT;
      valueFilterResult.selectedConcepts = conceptFilter.selectedConcepts;
      return valueFilterResult;
    }
    if (this.filter.isQuantityComparator(structuredQueryValueFilter.type)) {
      return this.createQuantityComparatorFilter(structuredQueryValueFilter, valueFilterResult) as ValueFilter;
    }
    if (this.filter.isQuantityRange(structuredQueryValueFilter.type)) {
      return this.createQuantityRangeFilter(structuredQueryValueFilter, valueFilterResult) as ValueFilter;
    }
  }

  private addTimeRestriction(timeRestriction: AbstractTimeRestriction): TimeRestriction {
    const resultTimeRestriction = new TimeRestriction();
    return resultTimeRestriction;
  }
}
