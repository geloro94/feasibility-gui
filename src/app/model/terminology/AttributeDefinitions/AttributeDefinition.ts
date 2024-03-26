import { TerminologyCode, TerminologyEntry } from '../Terminology';
import { AbstractAttributeDefinitions } from './AbstractAttributeDefinitions';

export class AttributeDefinition extends AbstractAttributeDefinitions {
  attributeCode: TerminologyCode;
  referenceCriteriaSet: string;
  referencedOnlyOnce = false;
  singleReference?: TerminologyEntry;
}
export class ValueDefinition extends AbstractAttributeDefinitions {}
