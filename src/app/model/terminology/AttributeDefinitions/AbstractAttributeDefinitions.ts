import { TerminologyCode } from '../Terminology';
import { QuantityUnit } from '../../query/Criterion/AttributeFilter/AbstractAttributeFilters';

export abstract class AbstractAttributeDefinitions {
  allowedUnits?: QuantityUnit[] = [];
  display?: string;
  max: number = null;
  min: number = null;
  optional = false;
  precision: number;
  selectableConcepts: TerminologyCode[] = [];
  type: ValueType;
}

export enum ValueType {
  QUANTITY = 'quantity',
  CONCEPT = 'concept',
  REFERENCE = 'reference',
}
