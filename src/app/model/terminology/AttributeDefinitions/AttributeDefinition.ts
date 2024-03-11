import { TerminologyCode, TerminologyEntry } from '../Terminology';
import { AbstractAttributeDefinitions } from './AbstractAttributeDefinitions';

export class AttributeDefinition extends AbstractAttributeDefinitions {
  attributeCode: TerminologyCode;
  referenceCriteriaSet: string;
  referenceOnlyOnce = false;
  singleReference?: TerminologyEntry;
}
export class ValueDefinition extends AbstractAttributeDefinitions {}
