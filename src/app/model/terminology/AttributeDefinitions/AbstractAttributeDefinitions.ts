import { QuantityUnit } from '../../FeasibilityQuery/Criterion/AttributeFilter/AbstractAttributeFilters';
import { TerminologyCode } from '../Terminology';

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
