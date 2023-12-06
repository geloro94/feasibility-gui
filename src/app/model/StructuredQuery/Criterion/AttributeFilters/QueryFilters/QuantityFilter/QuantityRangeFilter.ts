import { FilterTypes } from 'src/app/model/FilterTypes';
import { AbstractQuantityFilter } from './AbstractQuantityFilter';

export class QuantityRangeFilter extends AbstractQuantityFilter {
  minValue: number = null;
  maxValue: number = null;
  type: FilterTypes = FilterTypes.QUANTITY_RANGE;
}
