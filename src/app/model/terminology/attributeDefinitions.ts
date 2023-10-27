import { TerminologyCode } from './terminology';
import { QuantityUnit } from '../query/valueFilter';

export abstract class AttributeDefinitions {
  type: ValueType;
  display?: string;
  optional?: boolean = false;
  precision = 1;
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
