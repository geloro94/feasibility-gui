import { FilterTypes } from '../../../FilterTypes';
import { TerminologyCode } from '../../../terminology/Terminology';
import { AbstracStructuredQuerytAttributeFilters } from './AbstractStructuredQueryAttributeFilters';
import { StructuredQueryCriterion } from '../StructuredQueryCriterion';
import { AbstractStructuredQueryFilters } from './QueryFilters/AbstractStructuredQueryFilters';
import { AbstractQuantityFilter } from './QueryFilters/QuantityFilter/AbstractQuantityFilter';
import { AbstractConceptFilter } from './QueryFilters/ConceptFilter/AbstractConceptFilter';
import { ConceptAttributeFilter } from './QueryFilters/ConceptFilter/ConceptAttributeFilter';

export class StructuredQueryAttributeFilters extends AbstracStructuredQuerytAttributeFilters {
  attributeCode: TerminologyCode;
  conceptFilter: ConceptAttributeFilter;
  type: FilterTypes;
}
