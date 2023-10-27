import { TerminologyCode } from '../terminology/terminology';

export abstract class AttributeFilters {
  type: OperatorOptions;
  display?: string;

  // QUANTITY_COMPARATOR & QUANTITY_RANGE
  unit?: QuantityUnit;

  precision?: number;

  min?: number;

  max?: number;

  // QUANTITY_COMPARATOR
  value?: number;
  comparator?: Comparator;

  // QUANTITY_RANGE
  minValue?: number;
  maxValue?: number;

  // CONCEPT
  selectedConcepts?: TerminologyCode[] = [];
}

export class QuantityUnit {
  // UCUM
  code: string;
  display: string;
}

export enum Comparator {
  NONE = 'none',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne',
  LESS_OR_EQUAL = 'le',
  LESS_THAN = 'lt',
  GREATER_OR_EQUAL = 'ge',
  GREATER_THAN = 'gt',
}

export enum OperatorOptions {
  QUANTITY_COMPARATOR = 'quantity-comparator', // e.g. "< 27.10.2020"
  QUANTITY_RANGE = 'quantity-range', // e.g. ">= 27 and <= 30"
  CONCEPT = 'concept', // e.g. "weiblich, männlich"
  REFERENCE = 'reference',
  QUANTITY_NOT_SET = '',
}
