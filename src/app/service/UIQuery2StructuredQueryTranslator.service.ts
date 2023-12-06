import { AbstractAttributeFilters } from '../model/FeasibilityQuery/Criterion/AttributeFilter/AbstractAttributeFilters';
import { AbstractTimeRestriction } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/TimeRestriction/AbstractTimeRestriction';
import { AfterFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/TimeRestriction/AfterFilter';
import { AtFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/TimeRestriction/AtFilter';
import { AttributeFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/AttributeFilter';
import { BeforeFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/TimeRestriction/BeforeFilter';
import { BetweenFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/TimeRestriction/BetweenFilter';
import { ConceptAttributeFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/ConceptFilter/ConceptAttributeFilter';
import { ConceptValueFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/ConceptFilter/ConceptValueFilter';
import { Criterion } from '../model/FeasibilityQuery/Criterion/Criterion';
import { FeatureService } from './Feature.service';
import { FilterTypesService } from './FilterTypes.service';
import { Injectable } from '@angular/core';
import { ObjectHelper } from '../modules/querybuilder/controller/ObjectHelper';
import { QuantityComparatorFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/QuantityFilter/QuantityComparatorFilter';
import { QuantityRangeFilter } from '../model/StructuredQuery/Criterion/AttributeFilters/QueryFilters/QuantityFilter/QuantityRangeFilter';
import { Query } from '../model/FeasibilityQuery/Query';
import { StructuredQuery } from '../model/StructuredQuery/StructuredQuery';
import { StructuredQueryAttributeFilters } from '../model/StructuredQuery/Criterion/AttributeFilters/StructuredQueryAttributeFilters';
import { StructuredQueryCriterion } from '../model/StructuredQuery/Criterion/StructuredQueryCriterion';
import { StructuredQueryValueFilters } from '../model/StructuredQuery/Criterion/AttributeFilters/StructuredQueryValueFilters';
import { TerminologyCode } from '../model/terminology/Terminology';
import { TimeRestrictionType } from '../model/FeasibilityQuery/TimeRestriction';
import { ValueFilter } from '../model/FeasibilityQuery/Criterion/AttributeFilter/ValueFilter';

@Injectable({
  providedIn: 'root',
})
export class UIQuery2StructuredQueryTranslatorService {
  constructor(private featureService: FeatureService, private filter: FilterTypesService) {}

  public translateToSQ(query: Query): StructuredQuery {
    const result = new StructuredQuery();

    if (query.display) {
      result.display = query.display;
    }
    const exclusionCriteria = ObjectHelper.clone(query.groups[0].exclusionCriteria);
    const inclusionCriteria = ObjectHelper.clone(query.groups[0].inclusionCriteria);
    if (inclusionCriteria.length > 0) {
      result.inclusionCriteria = this.translateCriterionGroup(inclusionCriteria);
    } else {
      result.inclusionCriteria = [];
    }
    if (exclusionCriteria.length > 0) {
      result.exclusionCriteria = this.translateCriterionGroup(exclusionCriteria);
    } else {
      result.exclusionCriteria = undefined;
    }
    if (query.consent) {
      result.inclusionCriteria.push(this.getConsent());
    }
    return result;
  }

  private getConsent(): StructuredQueryCriterion[] {
    return [
      {
        termCodes: [
          {
            code: 'central-consent',
            system: 'mii.abide',
            display: 'MDAT wissenschaftlich nutzen - EU DSGVO Niveau',
          },
        ],
      },
    ];
  }

  private translateCriterionGroup(criterionGroup: Criterion[][]): StructuredQueryCriterion[][] {
    const structuredQueryCriterion: StructuredQueryCriterion[][] = [];
    criterionGroup.forEach((criterionArray) => {
      const innerArraySQ: StructuredQueryCriterion[] = this.translateInnerArray(criterionArray);
      structuredQueryCriterion.push(innerArraySQ);
    });
    return structuredQueryCriterion;
  }

  private translateInnerArray(criterionArray: Criterion[]) {
    const structuredQueryInnerArray: StructuredQueryCriterion[] = [];
    criterionArray.forEach((criterion) => {
      structuredQueryInnerArray.push(this.assignCriterionElements(criterion));
    });
    return structuredQueryInnerArray;
  }

  private assignCriterionElements(criterion: Criterion): StructuredQueryCriterion {
    const criterionSQ = new StructuredQueryCriterion();
    criterionSQ.attributeFilters = this.addAttributeFilter(criterion);
    criterionSQ.context = this.addContextToSQ(criterion);
    criterionSQ.termCodes = criterion.termCodes;
    criterionSQ.timeRestriction = this.addTimeRestrictionToSQ(criterion);
    criterionSQ.valueFilters = this.addValueFilter(criterion);
    return criterionSQ;
  }

  private addContextToSQ(criterion: Criterion): TerminologyCode | undefined {
    if (this.featureService.getSendSQContextToBackend()) {
      return criterion.context;
    } else {
      return undefined;
    }
  }
  private addAttributeFilter(criterion: Criterion): StructuredQueryAttributeFilters[] | undefined {
    if (criterion.attributeFilters.length > 0) {
      this.addAttributeFiltersToSQ(criterion);
    } else {
      return undefined;
    }
  }

  private addValueFilter(criterion: Criterion): StructuredQueryValueFilters[] | undefined {
    if (criterion.valueFilters.length > 0) {
      this.addValueFiltersToSQ(criterion);
    } else {
      return undefined;
    }
  }

  private addAttributeFiltersToSQ(
    criterion: Criterion
  ): StructuredQueryAttributeFilters[] | undefined {
    const structuredQueryAttributeFilters: StructuredQueryAttributeFilters[] = [];
    criterion.attributeFilters.forEach((attributeFilter) => {
      const structuredQueryAttributeFilter = this.assignAttributeFilter(attributeFilter);
      structuredQueryAttributeFilters.push(structuredQueryAttributeFilter);
      if (this.filter.isReference(attributeFilter.type)) {
        structuredQueryAttributeFilters.push(
          this.setReferences(criterion.linkedCriteria, attributeFilter)
        );
      }
    });
    return structuredQueryAttributeFilters;
  }

  private addValueFiltersToSQ(criterion: Criterion): StructuredQueryValueFilters[] | undefined {
    const structuredQueryValueFilters: StructuredQueryValueFilters[] = [];
    criterion.valueFilters.forEach((valueFilter) => {
      const structuredQueryValueFilter = this.assignValueFilters(valueFilter);
      structuredQueryValueFilters.push(structuredQueryValueFilter);
    });
    return structuredQueryValueFilters;
  }

  private assignAttributeFilter(attributeFilter: AttributeFilter): StructuredQueryAttributeFilters {
    const structuredQueryAttributeFilter: StructuredQueryAttributeFilters =
      new StructuredQueryAttributeFilters();
    structuredQueryAttributeFilter.attributeCode = attributeFilter.attributeCode;
    structuredQueryAttributeFilter.conceptFilter = this.setAttributeConceptFilter(attributeFilter);
    structuredQueryAttributeFilter.quantityComparatorFilter =
      this.setQuantityComparatorFilter(attributeFilter);
    structuredQueryAttributeFilter.quantityRangeFilter =
      this.setQuantityRangeFilter(attributeFilter);
    return structuredQueryAttributeFilter;
  }

  private assignValueFilters(valueFilter: ValueFilter): StructuredQueryValueFilters {
    const structuredQueryValueFilter: StructuredQueryValueFilters =
      new StructuredQueryValueFilters();
    structuredQueryValueFilter.conceptFilter = this.setValueConceptFilter(valueFilter);
    structuredQueryValueFilter.quantityComparatorFilter =
      this.setQuantityComparatorFilter(valueFilter);
    structuredQueryValueFilter.quantityRangeFilter = this.setQuantityRangeFilter(valueFilter);
    return structuredQueryValueFilter;
  }

  private setQuantityComparatorFilter(
    abstractFeasibilityQueryAttributeFilter: AbstractAttributeFilters
  ): QuantityComparatorFilter | undefined {
    const type = abstractFeasibilityQueryAttributeFilter.type;
    if (this.isQuantityFilter(type)) {
      this.setQuantityComparatorAttributes(abstractFeasibilityQueryAttributeFilter);
    } else {
      return undefined;
    }
  }

  private setQuantityRangeFilter(
    abstractFeasibilityQueryAttributeFilter: AbstractAttributeFilters
  ): QuantityRangeFilter | undefined {
    const type = abstractFeasibilityQueryAttributeFilter.type;
    if (this.isQuantityFilter(type)) {
      this.setQuantityRangeAttributes(abstractFeasibilityQueryAttributeFilter);
    } else {
      return undefined;
    }
  }

  private setAttributeConceptFilter(
    abstractFeasibilityQueryAttributeFilter
  ): ConceptAttributeFilter | undefined {
    if (this.filter.isConcept(abstractFeasibilityQueryAttributeFilter.type)) {
      this.setConceptAttributeFilter(abstractFeasibilityQueryAttributeFilter);
    } else {
      return undefined;
    }
  }

  private setValueConceptFilter(
    abstractFeasibilityQueryAttributeFilter
  ): ConceptValueFilter | undefined {
    if (this.filter.isConcept(abstractFeasibilityQueryAttributeFilter.type)) {
      this.setConceptValueFilter(abstractFeasibilityQueryAttributeFilter);
    } else {
      return undefined;
    }
  }

  private isQuantityFilter(abstractFeasibilityQueryAttributeFilter): boolean {
    if (this.filter.isQuantity(abstractFeasibilityQueryAttributeFilter.type)) {
      if (!this.filter.isNoneComparator(abstractFeasibilityQueryAttributeFilter.type)) {
        return true;
      }
    } else {
      return false;
    }
  }

  private addTimeRestrictionToSQ(criterion: Criterion): AbstractTimeRestriction {
    if (criterion.timeRestriction) {
      if (criterion.timeRestriction.minDate) {
        const startDate = new Date(criterion.timeRestriction.minDate);
        const endDate = new Date(criterion.timeRestriction.maxDate);
        const offset = startDate.getTimezoneOffset() / -60;
        startDate.setHours(23 + offset, 59, 59, 999);
        endDate.setHours(offset, 0, 0, 0);

        switch (criterion.timeRestriction.tvpe) {
          case TimeRestrictionType.AFTER: {
            const afterFilter = new AfterFilter();
            afterFilter.afterDate = startDate.toISOString().split('T')[0];
            return afterFilter;
          }
          case TimeRestrictionType.AT: {
            const atFilter = new AtFilter();
            atFilter.afterDate = startDate.toISOString().split('T')[0];
            atFilter.beforeDate = startDate.toISOString().split('T')[0];
            return atFilter;
          }
          case TimeRestrictionType.BEFORE: {
            const beforeFilter = new BeforeFilter();
            beforeFilter.beforeDate = startDate.toISOString().split('T')[0];
            return beforeFilter;
          }
          case TimeRestrictionType.BETWEEN: {
            const betweenFilter = new BetweenFilter();
            betweenFilter.afterDate = startDate.toISOString().split('T')[0];
            betweenFilter.beforeDate = endDate.toISOString().split('T')[0];
            return betweenFilter;
          }
        }
      }
    }
  }

  private setConceptAttributeFilter(attributeFilter: AttributeFilter): ConceptAttributeFilter {
    const conceptFilter = new ConceptAttributeFilter();
    conceptFilter.attributeCode = attributeFilter.attributeCode;
    conceptFilter.selectedConcepts = attributeFilter.selectedConcepts;
    return conceptFilter;
  }

  private setConceptValueFilter(valueFilter: ValueFilter): StructuredQueryValueFilters {
    const structuredQueryValueFilter = new StructuredQueryValueFilters();
    structuredQueryValueFilter.conceptFilter.selectedConcepts = valueFilter.selectedConcepts;
    return structuredQueryValueFilter;
  }

  private setReferences(
    linkedCriteria: Criterion[],
    attributeFilter: AttributeFilter
  ): StructuredQueryAttributeFilters {
    const structuredQueryAttributeFilter: StructuredQueryAttributeFilters =
      new StructuredQueryAttributeFilters();
    structuredQueryAttributeFilter.referenceFilter.attributeCode = attributeFilter.attributeCode;
    structuredQueryAttributeFilter.referenceFilter.criteria =
      this.setEachLinkedCriteria(linkedCriteria);
    return structuredQueryAttributeFilter;
  }

  private setEachLinkedCriteria(linkedCriteria: Criterion[]): StructuredQueryCriterion[] {
    const linkedCriteriaArray = new Array<StructuredQueryCriterion>();
    linkedCriteria.forEach((linkedCriterion) => {
      linkedCriteriaArray.push(this.assignCriterionElements(linkedCriterion));
    });
    return linkedCriteriaArray;
  }

  private setQuantityComparatorAttributes(
    feasibilityQuerytAttributeFilter: AbstractAttributeFilters
  ): QuantityComparatorFilter {
    const quantityComparatorFilter = new QuantityComparatorFilter();
    quantityComparatorFilter.comparator = feasibilityQuerytAttributeFilter.comparator;
    quantityComparatorFilter.unit = feasibilityQuerytAttributeFilter.unit;
    quantityComparatorFilter.value = feasibilityQuerytAttributeFilter.value;
    return quantityComparatorFilter;
  }

  private setQuantityRangeAttributes(
    feasibilityQuerytAttributeFilter: AbstractAttributeFilters
  ): QuantityRangeFilter {
    const quantityRangeFilter = new QuantityRangeFilter();
    quantityRangeFilter.maxValue = feasibilityQuerytAttributeFilter.maxValue;
    quantityRangeFilter.minValue = feasibilityQuerytAttributeFilter.minValue;
    quantityRangeFilter.unit = feasibilityQuerytAttributeFilter.unit;
    return quantityRangeFilter;
  }
}
