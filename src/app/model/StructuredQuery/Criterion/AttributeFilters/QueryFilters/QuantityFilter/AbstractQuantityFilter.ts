import { FilterTypes } from 'src/app/model/FilterTypes';
import { QuantityUnit } from 'src/app/model/FeasibilityQuery/Criterion/AttributeFilter/AbstractAttributeFilters';
import { AbstractStructuredQueryFilters } from '../AbstractStructuredQueryFilters';

export abstract class AbstractQuantityFilter extends AbstractStructuredQueryFilters {
  unit: QuantityUnit = new QuantityUnit();
  type: FilterTypes;
}
