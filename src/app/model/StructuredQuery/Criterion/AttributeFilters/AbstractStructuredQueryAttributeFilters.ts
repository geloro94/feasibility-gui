import { FilterTypes } from '../../../FilterTypes';
import { AbstractStructuredQueryFilters } from './QueryFilters/AbstractStructuredQueryFilters';
import { AbstractConceptFilter } from './QueryFilters/ConceptFilter/AbstractConceptFilter';
import { AbstractQuantityFilter } from './QueryFilters/QuantityFilter/AbstractQuantityFilter';
import { QuantityComparatorFilter } from './QueryFilters/QuantityFilter/QuantityComparatorFilter';
import { QuantityRangeFilter } from './QueryFilters/QuantityFilter/QuantityRangeFilter';
import { ReferenceFilter } from './QueryFilters/ReferenceFilter/ReferenceFilter';
import { AbstractTimeRestriction } from './QueryFilters/TimeRestriction/AbstractTimeRestriction';
import { AtFilter } from './QueryFilters/TimeRestriction/AtFilter';
import { BetweenFilter } from './QueryFilters/TimeRestriction/BetweenFilter';

export abstract class AbstracStructuredQuerytAttributeFilters {
  abstract conceptFilter: AbstractConceptFilter;
  type: FilterTypes;
  quantityRangeFilter: QuantityRangeFilter;
  quantityComparatorFilter: QuantityComparatorFilter;
  referenceFilter: ReferenceFilter;
  timeRestrictionFilter: AtFilter | BetweenFilter;
}
