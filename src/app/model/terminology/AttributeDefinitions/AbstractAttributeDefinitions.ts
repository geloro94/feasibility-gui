import { TerminologyCode } from '../Terminology';
import { QuantityUnit } from '../../query/Criterion/AttributeFilter/AbstractAttributeFilters';

export abstract class AbstractAttributeDefinitions {
  type: ValueType;
  display?: string;
  optional?: boolean = false;
  precision: number;
  max?: number;
  min?: number;
  allowedUnits?: QuantityUnit[] = [];
  selectableConcepts?: TerminologyCode[];
}

export enum ValueType {
  QUANTITY = 'quantity',
  CONCEPT = 'concept',
  REFERENCE = 'reference',
}
